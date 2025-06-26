import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectedIMAP_SMTP_CALDEVAccount } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connected-account.dto';
import { IMAP_SMTP_CALDEVConnectionSuccess } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection-success.dto';
import {
  AccountType,
  ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { IMAP_SMTP_CALDEVValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { IMAP_SMTP_CALDEVService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { GraphqlValidationExceptionFilter } from 'src/filters/graphql-validation-exception.filter';
import { IMAP_SMTP_CALDAVAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Resolver()
@UseFilters(
  GraphqlValidationExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class IMAP_SMTP_CALDEVResolver {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly ImapSmtpCaldavConnectionService: IMAP_SMTP_CALDEVService,
    private readonly imapSmtpCaldavApisService: IMAP_SMTP_CALDAVAPIService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly mailConnectionValidatorService: IMAP_SMTP_CALDEVValidatorService,
  ) {}

  private async checkIfFeatureEnabled(
    workspaceId: string,
    accountType: AccountType,
  ): Promise<void> {
    if (accountType.type === 'IMAP') {
      const isImapEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_IMAP_ENABLED,
        workspaceId,
      );

      if (!isImapEnabled) {
        throw new UserInputError(
          'IMAP feature is not enabled for this workspace',
        );
      }
    }

    if (accountType.type === 'SMTP') {
      throw new UserInputError(
        'SMTP feature is not enabled for this workspace',
      );
    }

    if (accountType.type === 'CALDAV') {
      throw new UserInputError(
        'CALDAV feature is not enabled for this workspace',
      );
    }
  }

  @Query(() => ConnectedIMAP_SMTP_CALDEVAccount)
  @UseGuards(WorkspaceAuthGuard)
  async getConnectedIMAP_SMTP_CALDEVAccount(
    @Args('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ConnectedIMAP_SMTP_CALDEVAccount> {
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

  @Mutation(() => IMAP_SMTP_CALDEVConnectionSuccess)
  @UseGuards(WorkspaceAuthGuard)
  async saveIMAP_SMTP_CALDEV(
    @Args('accountOwnerId') accountOwnerId: string,
    @Args('handle') handle: string,
    @Args('accountType') accountType: AccountType,
    @Args('connectionParameters')
    connectionParameters: ConnectionParameters,
    @AuthWorkspace() workspace: Workspace,
    @Args('id', { nullable: true }) id?: string,
  ): Promise<IMAP_SMTP_CALDEVConnectionSuccess> {
    await this.checkIfFeatureEnabled(workspace.id, accountType);

    const validatedParams =
      this.mailConnectionValidatorService.validateProtocolConnectionParams(
        connectionParameters,
      );

    await this.ImapSmtpCaldavConnectionService.testIMAP_SMTP_CALDEV(
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
