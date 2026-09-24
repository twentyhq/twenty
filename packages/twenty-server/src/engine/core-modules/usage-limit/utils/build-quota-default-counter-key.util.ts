import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaDefaultCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  meter,
  periodUnit,
  periodStart,
  limitValue,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  meter: QuotaMeter;
  periodUnit: AnchoredPeriodUnit;
  periodStart: Date;
  limitValue: number;
}): string =>
  `${buildQuotaCounterKey({ workspaceId, resourceType, operationType, spenderType, meter, periodUnit, periodStart })}:default:${limitValue}`;
