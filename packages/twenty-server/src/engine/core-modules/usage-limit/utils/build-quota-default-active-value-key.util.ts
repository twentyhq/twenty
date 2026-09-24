import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

// Holds the configured value the live default counter was warmed against. A
// counter keyed on its value is only retired while the value keeps moving to
// one never used this period; coming back to an earlier value would otherwise
// find that value's counter still holding the remaining it had when it was
// abandoned.
export const buildQuotaDefaultActiveValueKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  meter,
  periodUnit,
  periodStart,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  meter: QuotaMeter;
  periodUnit: PeriodUnit;
  periodStart: Date;
}): string =>
  `${buildQuotaCounterKey({ workspaceId, resourceType, operationType, spenderType, meter, periodUnit, periodStart })}:default:active`;
