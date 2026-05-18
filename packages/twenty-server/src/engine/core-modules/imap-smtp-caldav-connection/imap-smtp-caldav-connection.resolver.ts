import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ACCOUNT_TYPES } from 'src/engine/core-modules/imap-smtp-caldav-connection/constants/account-types.constant';
import { ConnectedImapSmtpCaldavAccountDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connected-account.dto';
import { ImapSmtpCaldavConnectionSuccessDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection-success.dto';
import { EmailAccountConnectionParametersInput } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { ImapSmtpCaldavValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class ImapSmtpCaldavResolver {
  constructor(
    private readonly ImapSmtpCaldavConnectionService: ImapSmtpCaldavService,
    private readonly imapSmtpCaldavApisService: ImapSmtpCalDavAPIService,
    private readonly mailConnectionValidatorService: ImapSmtpCaldavValidatorService,
  ) {}

  @Query(() => ConnectedImapSmtpCaldavAccountDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
  )
  async getConnectedImapSmtpCaldavAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedImapSmtpCaldavAccountDTO> {
    const connectedAccount =
      await this.imapSmtpCaldavApisService.getImapSmtpCaldavConnectedAccount(
        workspace.id,
        id,
      );

    if (!isDefined(connectedAccount) || !isDefined(connectedAccount?.handle)) {
      throw new UserInputError(
        `Connected mail account with ID ${id} not found`,
      );
    }

    if (connectedAccount.userWorkspaceId !== userWorkspaceId) {
      throw new UserInputError(
        `Connected mail account with ID ${id} not found`,
      );
    }

    return {
      id: connectedAccount.id,
      handle: connectedAccount.handle,
      provider: connectedAccount.provider,
      connectionParameters: connectedAccount.connectionParameters,
      userWorkspaceId: connectedAccount.userWorkspaceId,
    };
  }

  @Mutation(() => ImapSmtpCaldavConnectionSuccessDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
  )
  async saveImapSmtpCaldavAccount(
    @Args('accountOwnerId', { type: () => UUIDScalarType })
    accountOwnerId: string,
    @Args('handle') handle: string,
    @Args('connectionParameters')
    connectionParameters: EmailAccountConnectionParametersInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
  ): Promise<ImapSmtpCaldavConnectionSuccessDTO> {
    const existingAccount = isDefined(id)
      ? await this.ImapSmtpCaldavConnectionService.getImapSmtpCaldav(
          workspace.id,
          id,
        )
      : null;

    const validatedParams = await this.validateAndTestConnectionParameters({
      connectionParameters,
      handle,
      existingConnectionParameters:
        existingAccount?.connectionParameters ?? null,
    });

    const connectedAccountId =
      await this.imapSmtpCaldavApisService.processAccount({
        handle,
        workspaceMemberId: accountOwnerId,
        workspaceId: workspace.id,
        connectionParameters: validatedParams,
        connectedAccountId: id,
      });

    return {
      success: true,
      connectedAccountId,
    };
  }

  private async validateAndTestConnectionParameters({
    connectionParameters,
    handle,
    existingConnectionParameters,
  }: {
    connectionParameters: EmailAccountConnectionParametersInput;
    handle: string;
    existingConnectionParameters: ImapSmtpCaldavParams | null;
  }): Promise<ImapSmtpCaldavParams> {
    const validatedParams: ImapSmtpCaldavParams = {};

    for (const protocol of ACCOUNT_TYPES) {
      const params = connectionParameters[protocol];

      if (params) {
        const existingProtocolParams =
          existingConnectionParameters?.[protocol] ?? null;

        const validatedProtocolParams =
          await this.mailConnectionValidatorService.validateProtocolConnectionParams(
            {
              params,
              existingProtocolParams,
            },
          );

        if (validatedProtocolParams && isDefined(params.password)) {
          await this.ImapSmtpCaldavConnectionService.testImapSmtpCaldav({
            handle,
            params: validatedProtocolParams,
            accountType: protocol,
          });
        }

        validatedParams[protocol] = validatedProtocolParams;
      }
    }

    return validatedParams;
  }
}
