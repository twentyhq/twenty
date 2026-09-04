/* @license Enterprise */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isUsageOperationTypeValue } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Each operation type has one canonical counting unit — matches how
// `ai-billing.service.ts` emits native usage events.
const USAGE_UNIT_BY_OPERATION_TYPE: Record<
  Exclude<UsageOperationType, UsageOperationType.ALL>,
  UsageUnit
> = {
  [UsageOperationType.AI_CHAT_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.WORKFLOW_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.CODE_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.WEB_SEARCH]: UsageUnit.INVOCATION,
  [UsageOperationType.CALL_RECORDING]: UsageUnit.MINUTE,
  [UsageOperationType.EMAIL_SEND]: UsageUnit.INVOCATION,
  [UsageOperationType.API_REQUEST]: UsageUnit.REQUEST,
  // Platform-raised only; ApplicationRecurringChargeService sets its own unit.
  [UsageOperationType.SUBSCRIPTION]: UsageUnit.CREDIT,
};

// `workspaceId` + `applicationId` come from the application-access token,
// never from the body — an app can't charge a different workspace or
// masquerade as a different app.
@Injectable()
export class AppBillingService {
  private readonly logger = new Logger(AppBillingService.name);

  constructor(
    private readonly usageRecorderService: UsageRecorderService,
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

    const [operationType, attributedUserWorkspaceId] = await Promise.all([
      this.resolveOperationType({ workspaceId, applicationId, charge }),
      userWorkspaceId ??
        this.findWorkspaceScopedUserWorkspaceId({
          workspaceId,
          userWorkspaceId: charge.userWorkspaceId,
        }),
    ]);

    const unit = USAGE_UNIT_BY_OPERATION_TYPE[operationType];

    this.logger.log(
      `App charge from applicationId=${applicationId} workspaceId=${workspaceId}: ` +
        `${charge.creditsUsedMicro} micro-credits (${charge.quantity} ${unit}, ${operationType})`,
    );

    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.APP,
        operationType,
        creditsUsedMicro: charge.creditsUsedMicro,
        quantity: charge.quantity,
        unit,
        resourceId: applicationId,
        resourceContext: charge.operation ?? charge.resourceContext ?? null,
        spenders: { userWorkspaceId: attributedUserWorkspaceId, applicationId },
      },
    ]);
  }

  private async resolveOperationType({
    workspaceId,
    applicationId,
    charge,
  }: {
    workspaceId: string;
    applicationId: string;
    charge: ChargeDto;
  }): Promise<Exclude<UsageOperationType, UsageOperationType.ALL>> {
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
    // Own-property only: an operation named `constructor` or `__proto__` would
    // otherwise resolve to an inherited value and charge under no category.
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

    // `operations` is jsonb, so the declaration is untrusted at the point it is
    // used however the manifest typed it. An unknown value indexes the enum to
    // undefined and records a row with no category and no unit, and a
    // platform-only value like SUBSCRIPTION would let the declared-operation
    // path raise what ChargeDto's @IsIn stops an app raising directly.
    if (!isUsageOperationTypeValue(billableOperation.operationType)) {
      throw new BadRequestException(
        `Billable operation "${charge.operation}" declares an unknown operationType.`,
      );
    }

    // Indexing the enum by the manifest literal is also what stops
    // twenty-shared's USAGE_OPERATION_TYPES from promising apps a category the
    // platform does not meter: a drifted value fails to compile here.
    return UsageOperationType[billableOperation.operationType];
  }

  // Scoped to the token's workspace, so an app cannot attribute its spend to
  // someone outside the workspace its token was issued for.
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
