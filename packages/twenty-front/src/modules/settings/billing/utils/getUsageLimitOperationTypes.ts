import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
} from '~/generated-metadata/graphql';

type UsageLimitDefinition =
  UsageQuotaDefinitionsQuery['usageQuotaDefinitions']['definitions'][number];

export const getUsageLimitOperationTypes = (
  definition: UsageLimitDefinition,
): UsageOperationType[] =>
  definition.allowedMeters.includes('creditsUsedMicro')
    ? [UsageOperationType.ALL, ...definition.allowedOperationTypes]
    : definition.allowedOperationTypes;
