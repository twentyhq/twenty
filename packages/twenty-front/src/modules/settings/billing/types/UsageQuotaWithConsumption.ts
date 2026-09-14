import { type UsageQuotasWithConsumptionQuery } from '~/generated-metadata/graphql';

export type UsageQuotaWithConsumption =
  UsageQuotasWithConsumptionQuery['usageQuotasWithConsumption'][number];
