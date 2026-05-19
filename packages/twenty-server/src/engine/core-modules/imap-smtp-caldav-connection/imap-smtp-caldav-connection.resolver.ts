import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectedImapSmtpCaldavAccountDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connected-account.dto';
import { ImapSmtpCaldavConnectionSuccessDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection-success.dto';
import { EmailAccountConnectionParametersInput } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.input';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { buildPublicConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-public-connection-parameters.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class ImapSmtpCaldavResolver {
  constructor(
    private readonly imapSmtpCaldavService: ImapSmtpCaldavService,
    private readonly imapSmtpCaldavApisService: ImapSmtpCalDavAPIService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
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
      await this.connectedAccountMetadataService.findByIdAndUserWorkspaceId({
        id,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    if (
      !isDefined(connectedAccount) ||
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV
    ) {
      throw new UserInputError('Connected account not found');
    }

    return {
      id: connectedAccount.id,
      handle: connectedAccount.handle,
      provider: connectedAccount.provider,
      connectionParameters: buildPublicConnectionParameters(
        connectedAccount.connectionParameters,
      ),
      userWorkspaceId: connectedAccount.userWorkspaceId,
    };
  }

  @Mutation(() => ImapSmtpCaldavConnectionSuccessDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS),
  )
  async saveImapSmtpCaldavAccount(
    @Args('handle') handle: string,
    @Args('connectionParameters')
    connectionParameters: EmailAccountConnectionParametersInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
  ): Promise<ImapSmtpCaldavConnectionSuccessDTO> {
    const existingAccount = isDefined(id)
      ? await this.connectedAccountMetadataService.findByIdAndUserWorkspaceId({
          id,
          userWorkspaceId,
          workspaceId: workspace.id,
        })
      : null;

    if (
      isDefined(id) &&
      (!existingAccount ||
        existingAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV)
    ) {
      throw new UserInputError('Connected account not found');
    }

    const decryptedExistingParams = existingAccount?.connectionParameters
      ? this.connectedAccountTokenEncryptionService.decryptConnectionParameters(
          {
            connectionParameters: existingAccount.connectionParameters,
            workspaceId: workspace.id,
          },
        )
      : null;

    const validatedParams =
      await this.imapSmtpCaldavService.validateAndTestConnectionParameters({
        connectionParameters,
        handle,
        existingConnectionParameters: decryptedExistingParams,
      });

    const connectedAccountId =
      await this.imapSmtpCaldavApisService.upsertConnectedAccount({
        handle,
        userWorkspaceId,
        workspaceId: workspace.id,
        connectionParameters: validatedParams,
        existingAccount,
      });

    return {
      success: true,
      connectedAccountId,
    };
  }
}
