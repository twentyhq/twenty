/* @license Enterprise */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// Each operation type has one canonical counting unit — matches how
// `ai-billing.service.ts` emits native usage events.
const USAGE_UNIT_BY_OPERATION_TYPE: Record<UsageOperationType, UsageUnit> = {
  [UsageOperationType.AI_CHAT_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.WORKFLOW_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.CODE_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.WEB_SEARCH]: UsageUnit.INVOCATION,
  [UsageOperationType.CALL_RECORDING]: UsageUnit.MINUTE,
  [UsageOperationType.EMAIL_SEND]: UsageUnit.INVOCATION,
};

// `workspaceId` + `applicationId` come from the application-access token,
// never from the body — an app can't charge a different workspace or
// masquerade as a different app.
@Injectable()
export class AppBillingService {
  private readonly logger = new Logger(AppBillingService.name);

  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly billingService: BillingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async emitChargeEvent(params: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string | null;
    charge: ChargeDto;
  }): Promise<void> {
    const { workspaceId, applicationId, userWorkspaceId, charge } = params;

    const [operationType, attributedUserWorkspaceId, periodStart] =
      await Promise.all([
        this.resolveOperationType({ workspaceId, applicationId, charge }),
        userWorkspaceId ??
          this.findWorkspaceScopedUserWorkspaceId(
            workspaceId,
            charge.userWorkspaceId,
          ),
        this.resolveBillingPeriodStart(workspaceId),
      ]);

    const unit = USAGE_UNIT_BY_OPERATION_TYPE[operationType];

    this.logger.log(
      `App charge from applicationId=${applicationId} workspaceId=${workspaceId}: ` +
        `${charge.creditsUsedMicro} micro-credits (${charge.quantity} ${unit}, ${operationType})`,
    );

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.APP,
          operationType,
          creditsUsedMicro: charge.creditsUsedMicro,
          quantity: charge.quantity,
          unit,
          resourceId: applicationId,
          resourceContext: charge.operation ?? charge.resourceContext ?? null,
          userWorkspaceId: attributedUserWorkspaceId,
          periodStart,
        },
      ],
      workspaceId,
    );
  }

  private async resolveOperationType({
    workspaceId,
    applicationId,
    charge,
  }: {
    workspaceId: string;
    applicationId: string;
    charge: ChargeDto;
  }): Promise<UsageOperationType> {
    if (!isDefined(charge.operation)) {
      if (!isDefined(charge.operationType)) {
        throw new BadRequestException(
          'A charge must name either an operation or an operationType.',
        );
      }

      return UsageOperationType[charge.operationType];
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const application = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );
    // Undefined until the upgrade that adds the column has run.
    const billableOperations = application?.billing?.operations ?? {};
    const billableOperation = billableOperations[charge.operation];

    if (!isDefined(billableOperation)) {
      throw new BadRequestException(
        `Application declares no billable operation named "${charge.operation}".`,
      );
    }

    // Indexing the enum by the manifest literal is what stops twenty-shared's
    // USAGE_OPERATION_TYPES from promising apps a category the platform does
    // not meter: a drifted value fails to compile here.
    return UsageOperationType[billableOperation.operationType];
  }

  private async resolveBillingPeriodStart(
    workspaceId: string,
  ): Promise<Date | undefined> {
    if (!this.billingService.isBillingEnabled()) {
      return undefined;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return currentBillingSubscription === NO_BILLING_SUBSCRIPTION
      ? undefined
      : currentBillingSubscription.currentPeriodStart;
  }

  // Scoped to the token's workspace, so an app cannot attribute its spend to
  // someone outside the workspace its token was issued for.
  private async findWorkspaceScopedUserWorkspaceId(
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<string | null> {
    if (!isDefined(userWorkspaceId)) {
      return null;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
      select: { id: true },
    });

    return userWorkspace?.id ?? null;
  }
}
