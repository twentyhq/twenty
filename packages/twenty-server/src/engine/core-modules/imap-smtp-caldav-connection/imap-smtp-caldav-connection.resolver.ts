import {
  HttpException,
  HttpStatus,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectedImapSmtpCaldavAccount } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connected-account.dto';
import { ImapSmtpCaldavConnectionSuccess } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection-success.dto';
import {
  AccountType,
  ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { ImapSmtpCaldavValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionsGuard(SettingPermissionType.WORKSPACE))
export class ImapSmtpCaldavResolver {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly ImapSmtpCaldavConnectionService: ImapSmtpCaldavService,
    private readonly imapSmtpCaldavApisService: ImapSmtpCalDavAPIService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly mailConnectionValidatorService: ImapSmtpCaldavValidatorService,
  ) {}

  @Query(() => ConnectedImapSmtpCaldavAccount)
  @UseGuards(WorkspaceAuthGuard)
  async getConnectedImapSmtpCaldavAccount(
    @Args('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ConnectedImapSmtpCaldavAccount> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id, provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV },
    });

    if (!connectedAccount) {
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

  @Mutation(() => ImapSmtpCaldavConnectionSuccess)
  @UseGuards(WorkspaceAuthGuard)
  async saveImapSmtpCaldav(
    @Args('accountOwnerId') accountOwnerId: string,
    @Args('handle') handle: string,
    @Args('accountType') accountType: AccountType,
    @Args('connectionParameters')
    connectionParameters: ConnectionParameters,
    @AuthWorkspace() workspace: Workspace,
    @Args('id', { nullable: true }) id?: string,
  ): Promise<ImapSmtpCaldavConnectionSuccess> {
    const isImapSmtpCaldavFeatureFlagEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_IMAP_SMTP_CALDAV_ENABLED,
        workspace.id,
      );

    if (!isImapSmtpCaldavFeatureFlagEnabled) {
      throw new HttpException(
        'IMAP, SMTP, CalDAV feature is not enabled for this workspace',
        HttpStatus.FORBIDDEN,
      );
    }

    const validatedParams =
      this.mailConnectionValidatorService.validateProtocolConnectionParams(
        connectionParameters,
      );

    await this.ImapSmtpCaldavConnectionService.testImapSmtpCaldav(
      handle,
      validatedParams,
      accountType.type,
    );

    await this.imapSmtpCaldavApisService.setupConnectedAccount({
      handle,
      workspaceMemberId: accountOwnerId,
      workspaceId: workspace.id,
      connectionParams: validatedParams,
      accountType: accountType.type,
      connectedAccountId: id,
    });

    return {
      success: true,
    };
  }
}
