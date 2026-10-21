/* @license Enterprise */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type BillableOperationFreeAllowance,
  isBillableOperationFreeAllowance,
  isUsageOperationTypeValue,
  type UsageOperationTypeValue,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { computeCreditsUsedMicroBeyondFreeAllowance } from 'src/engine/core-modules/billing/app-billing/utils/compute-credits-used-micro-beyond-free-allowance.util';
import { isFreeAllowanceOpen } from 'src/engine/core-modules/billing/app-billing/utils/is-free-allowance-open.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AppChargeableOperationType =
  (typeof UsageOperationType)[UsageOperationTypeValue];

type ResolvedBillableOperation = {
  operationType: AppChargeableOperationType;
  freeAllowance?: BillableOperationFreeAllowance;
  installedAt?: Date;
};

// Apps send a quantity, never a unit, so the platform names what it counts.
// Keyed on the app-facing vocabulary so a new USAGE_OPERATION_TYPES value fails to compile until it has a unit
const USAGE_UNIT_BY_OPERATION_TYPE: Record<
  AppChargeableOperationType,
  UsageUnit
> = {
  [UsageOperationType.AI_CHAT_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.WORKFLOW_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.CODE_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.WEB_SEARCH]: UsageUnit.INVOCATION,
  [UsageOperationType.CALL_RECORDING]: UsageUnit.MINUTE,
  [UsageOperationType.EMAIL_SEND]: UsageUnit.INVOCATION,
};

// workspaceId and applicationId come from the token, never the body, so an app can't charge another workspace or pose as another app
@Injectable()
export class AppBillingService {
  private readonly logger = new Logger(AppBillingService.name);

  constructor(
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async emitChargeEvent(params: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string | null;
    charge: ChargeDto;
  }): Promise<void> {
    const { workspaceId, applicationId, userWorkspaceId, charge } = params;

    const [billableOperation, attributedUserWorkspaceId] = await Promise.all([
      this.resolveBillableOperation({ workspaceId, applicationId, charge }),
      userWorkspaceId ??
        this.findWorkspaceScopedUserWorkspaceId({
          workspaceId,
          userWorkspaceId: charge.userWorkspaceId,
        }),
    ]);

    const { operationType } = billableOperation;
    const unit = USAGE_UNIT_BY_OPERATION_TYPE[operationType];

    const creditsUsedMicro = await this.computeCreditsUsedMicroToBill({
      workspaceId,
      applicationId,
      charge,
      billableOperation,
    });

    this.logger.log(
      `App charge from applicationId=${applicationId} workspaceId=${workspaceId}: ` +
        `${creditsUsedMicro} of ${charge.creditsUsedMicro} micro-credits billed (${charge.quantity} ${unit}, ${operationType})`,
    );

    await this.usageLimitQuotaService.charge({
      workspaceId,
      events: [
        {
          resourceType: UsageResourceType.APP,
          operationType,
          creditsUsedMicro,
          quantity: charge.quantity,
          unit,
          resourceId: applicationId,
          resourceContext: charge.operation ?? charge.resourceContext ?? null,
          spenders: {
            userWorkspaceId: attributedUserWorkspaceId,
            applicationId,
          },
        },
      ],
    });
  }

  private async computeCreditsUsedMicroToBill({
    workspaceId,
    applicationId,
    charge,
    billableOperation: { freeAllowance, installedAt },
  }: {
    workspaceId: string;
    applicationId: string;
    charge: ChargeDto;
    billableOperation: ResolvedBillableOperation;
  }): Promise<number> {
    if (
      !isDefined(freeAllowance) ||
      !isDefined(installedAt) ||
      !isDefined(charge.operation)
    ) {
      return charge.creditsUsedMicro;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { createdAt: true },
    });

    if (
      !isDefined(workspace) ||
      !isFreeAllowanceOpen({
        freeAllowance,
        installedAt,
        workspaceCreatedAt: workspace.createdAt,
        now: new Date(),
      })
    ) {
      return charge.creditsUsedMicro;
    }

    if (!isDefined(freeAllowance.quantity)) {
      return 0;
    }

    // Usage rows land asynchronously, so charges arriving back to back can each see the other's minutes as still free
    const quantityAlreadyCharged =
      await this.usageAnalyticsService.getQuantityChargedForApplicationOperation(
        {
          workspaceId,
          applicationId,
          operation: charge.operation,
          since: installedAt,
        },
      );

    return computeCreditsUsedMicroBeyondFreeAllowance({
      creditsUsedMicro: charge.creditsUsedMicro,
      quantity: charge.quantity,
      freeQuantityRemaining: freeAllowance.quantity - quantityAlreadyCharged,
    });
  }

  private async resolveBillableOperation({
    workspaceId,
    applicationId,
    charge,
  }: {
    workspaceId: string;
    applicationId: string;
    charge: ChargeDto;
  }): Promise<ResolvedBillableOperation> {
    if (!isDefined(charge.operation)) {
      if (!isDefined(charge.operationType)) {
        throw new BadRequestException(
          'A charge must name either an operation or an operationType.',
        );
      }

      return { operationType: UsageOperationType[charge.operationType] };
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
    // Own-property only: `constructor` or `__proto__` would resolve to inherited values and charge under no category
    const billableOperation = Object.prototype.hasOwnProperty.call(
      billableOperations,
      charge.operation,
    )
      ? billableOperations[charge.operation]
      : undefined;

    if (!isDefined(billableOperation)) {
      throw new BadRequestException(
        `Application declares no billable operation named "${charge.operation}".`,
      );
    }

    // jsonb is untrusted: an unknown value would record a row with no category or unit,
    // and a platform-only value like SUBSCRIPTION would bypass ChargeDto's @IsIn
    if (!isUsageOperationTypeValue(billableOperation.operationType)) {
      throw new BadRequestException(
        `Billable operation "${charge.operation}" declares an unknown operationType.`,
      );
    }

    const { freeAllowance } = billableOperation;
    const isFreeAllowanceWellFormed =
      isBillableOperationFreeAllowance(freeAllowance);

    if (isDefined(freeAllowance) && !isFreeAllowanceWellFormed) {
      this.logger.warn(
        `Billable operation "${charge.operation}" of applicationId=${applicationId} declares a malformed freeAllowance; billing the charge in full`,
      );
    }

    return {
      // Indexing by the manifest literal makes a drifted USAGE_OPERATION_TYPES value fail to compile
      operationType: UsageOperationType[billableOperation.operationType],
      freeAllowance: isFreeAllowanceWellFormed ? freeAllowance : undefined,
      installedAt: isDefined(application)
        ? new Date(application.createdAt)
        : undefined,
    };
  }

  // Scoped to the token's workspace so an app cannot attribute spend outside it
  private async findWorkspaceScopedUserWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<string | null> {
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
