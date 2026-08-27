/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { type ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';

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
  [UsageOperationType.API_REQUEST]: UsageUnit.REQUEST,
};

// `workspaceId` + `applicationId` come from the application-access token,
// never from the body — an app can't charge a different workspace or
// masquerade as a different app.
@Injectable()
export class AppBillingService {
  private readonly logger = new Logger(AppBillingService.name);

  constructor(private readonly usageRecorderService: UsageRecorderService) {}

  async emitChargeEvent(params: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string | null;
    charge: ChargeDto;
  }): Promise<void> {
    const { workspaceId, applicationId, userWorkspaceId, charge } = params;
    const unit = USAGE_UNIT_BY_OPERATION_TYPE[charge.operationType];

    this.logger.log(
      `App charge from applicationId=${applicationId} workspaceId=${workspaceId}: ` +
        `${charge.creditsUsedMicro} micro-credits (${charge.quantity} ${unit}, ${charge.operationType})`,
    );

    await this.usageRecorderService.record(workspaceId, {
      resourceType: UsageResourceType.APP,
      operationType: charge.operationType,
      creditsUsedMicro: charge.creditsUsedMicro,
      quantity: charge.quantity,
      unit,
      resourceId: applicationId,
      resourceContext: charge.resourceContext ?? null,
      spenders: { userWorkspaceId, applicationId },
    });
  }
}
