import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsagePeriodAnchor } from 'src/engine/core-modules/usage/types/usage-period-anchor.type';

export type UsageConsumptionWindow = {
  windowKey: string;
  resourceTypes: UsageResourceType[];
  periodStart: Date;
  periodEnd: Date;
  periodAnchor: UsagePeriodAnchor;
};
