import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectedImapSmtpCaldavAccountDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connected-account.dto';
import { ImapSmtpCaldavConnectionSuccessDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection-success.dto';
import { EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { ImapSmtpCaldavValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
export class ImapSmtpCaldavResolver {
  constructor(
    private readonly ImapSmtpCaldavConnectionService: ImapSmtpCaldavService,
    private readonly imapSmtpCaldavApisService: ImapSmtpCalDavAPIService,
    private readonly mailConnectionValidatorService: ImapSmtpCaldavValidatorService,
  ) {}

  @Query(() => ConnectedImapSmtpCaldavAccountDTO)
  @UseGuards(WorkspaceAuthGuard)
  async getConnectedImapSmtpCaldavAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
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

    return {
      id: connectedAccount.id,
      handle: connectedAccount.handle,
      provider: connectedAccount.provider,
      connectionParameters: connectedAccount.connectionParameters,
      accountOwnerId: connectedAccount.accountOwnerId,
    };
  }

  @Mutation(() => ImapSmtpCaldavConnectionSuccessDTO)
  @UseGuards(WorkspaceAuthGuard)
  async saveImapSmtpCaldavAccount(
    @Args('accountOwnerId', { type: () => UUIDScalarType })
    accountOwnerId: string,
    @Args('handle') handle: string,
    @Args('connectionParameters')
    connectionParameters: EmailAccountConnectionParameters,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
  ): Promise<ImapSmtpCaldavConnectionSuccessDTO> {
    const validatedParams = await this.validateAndTestConnectionParameters(
      connectionParameters,
      handle,
    );

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

  private async validateAndTestConnectionParameters(
    connectionParameters: EmailAccountConnectionParameters,
    handle: string,
  ): Promise<EmailAccountConnectionParameters> {
    const validatedParams: EmailAccountConnectionParameters = {};
    const protocols = ['IMAP', 'SMTP', 'CALDAV'] as const;

    for (const protocol of protocols) {
      const params = connectionParameters[protocol];

      if (params) {
        validatedParams[protocol] =
          this.mailConnectionValidatorService.validateProtocolConnectionParams(
            params,
          );
        const validatedProtocolParams = validatedParams[protocol];

        if (validatedProtocolParams) {
          await this.ImapSmtpCaldavConnectionService.testImapSmtpCaldav(
            handle,
            validatedProtocolParams,
            protocol,
          );
        }
      }
    }

    return validatedParams;
  }
}
