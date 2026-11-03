import { UsageUnit } from '~/generated-metadata/graphql';

export const isCreditUsageUnit = (unit: UsageUnit | null): boolean =>
  unit === UsageUnit.CREDIT || unit === UsageUnit.USER_CREDIT;
