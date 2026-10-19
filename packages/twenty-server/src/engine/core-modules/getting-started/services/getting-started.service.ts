import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/twenty-public-app-universal-identifiers.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import {
  ConnectedAccountProvider,
  GETTING_STARTED_STEPS,
  type GettingStartedProgress,
  type GettingStartedStep,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type GettingStartedScope = {
  userId: string;
  workspaceId: string;
  userWorkspaceId: string;
};
type GettingStartedVariables = Record<string, boolean | string | null>;

const PREFIX = 'gettingStarted';

@Injectable()
export class GettingStartedService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedVariables>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(BillingCreditGrantEntity)
    private readonly creditGrantRepository: WorkspaceScopedRepository<BillingCreditGrantEntity>,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly workflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async getProgress(
    scope: GettingStartedScope,
  ): Promise<GettingStartedProgress> {
    const variables = await this.userVarsService.getAll(scope);
    const completedSteps = GETTING_STARTED_STEPS.filter(
      (step) => variables.get(`${PREFIX}.completed.${step}`) === true,
    );
    const hasConnectedMailbox = await this.connectedAccountRepository.exists({
      where: {
        workspaceId: scope.workspaceId,
        userWorkspaceId: scope.userWorkspaceId,
        provider: In([
          ConnectedAccountProvider.GOOGLE,
          ConnectedAccountProvider.MICROSOFT,
          ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        ]),
        archivedAt: IsNull(),
      },
    });
    if (hasConnectedMailbox && !completedSteps.includes('connectMailbox')) {
      await this.completeStep(scope, 'connectMailbox');
      completedSteps.push('connectMailbox');
    }
    const hasInstalledApp = await this.applicationRepository.exists(
      scope.workspaceId,
      {
        where: {
          workspaceId: scope.workspaceId,
          universalIdentifier: In([
            TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER,
            TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.PEOPLE_DATA_LABS,
            TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT,
          ]),
        },
      },
    );
    if (hasInstalledApp && !completedSteps.includes('installApp')) {
      await this.completeStep(scope, 'installApp');
      completedSteps.push('installApp');
    }
    const hasHandover = await this.workflowRepository.exists(
      scope.workspaceId,
      {
        where: {
          workspaceId: scope.workspaceId,
          createdByUserWorkspaceId: scope.userWorkspaceId,
          name: 'Hand over won deals',
          lastPublishedCoreWorkflowVersionId: Not(IsNull()),
        },
      },
    );
    if (hasHandover && !completedSteps.includes('handoverDeals')) {
      await this.completeStep(scope, 'handoverDeals');
      completedSteps.push('handoverDeals');
    }
    const grants = await this.creditGrantRepository.find(scope.workspaceId, {
      where: [
        {
          workspaceId: scope.workspaceId,
          idempotencyKey: `onboarding-import-contacts:${scope.workspaceId}`,
          revokedAt: IsNull(),
        },
        {
          workspaceId: scope.workspaceId,
          idempotencyKey: Like(`onboarding-invite-team:${scope.workspaceId}:%`),
          revokedAt: IsNull(),
        },
      ],
    });
    const creditsEarned =
      grants.reduce((total, grant) => total + grant.amountMicro, 0) / 1_000_000;
    const selectedStep = variables.get(`${PREFIX}.selectedStep`);
    const snoozedUntil = variables.get(`${PREFIX}.snoozedUntil`);
    return {
      creditsEarned,
      completedSteps,
      selectedStep:
        typeof selectedStep === 'string' &&
        GETTING_STARTED_STEPS.some((step) => step === selectedStep)
          ? (selectedStep as GettingStartedStep)
          : null,
      snoozedUntil: typeof snoozedUntil === 'string' ? snoozedUntil : null,
    };
  }

  async completeStep(
    scope: Pick<GettingStartedScope, 'userId' | 'workspaceId'>,
    step: GettingStartedStep,
  ) {
    await this.userVarsService.set({
      ...scope,
      key: `${PREFIX}.completed.${step}`,
      value: true,
    });
  }

  async updateProgress(
    scope: GettingStartedScope,
    input: UpdateGettingStartedInput,
  ) {
    if (isDefined(input.completedStep)) {
      await this.completeStep(scope, input.completedStep);
    }
    if (isDefined(input.selectedStep)) {
      await this.userVarsService.set({
        ...scope,
        key: `${PREFIX}.selectedStep`,
        value: input.selectedStep,
      });
    }
    if (input.snoozedUntil !== undefined) {
      await this.userVarsService.set({
        ...scope,
        key: `${PREFIX}.snoozedUntil`,
        value: input.snoozedUntil,
      });
    }
    return this.getProgress(scope);
  }
}
