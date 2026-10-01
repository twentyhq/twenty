import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
} from '~/generated-metadata/graphql';

type UsageLimitDefinition =
  UsageQuotaDefinitionsQuery['usageQuotaDefinitions']['definitions'][number];

export const getUsageLimitOperationTypes = (
  definition: UsageLimitDefinition,
): UsageOperationType[] =>
  definition.allowedMeters.includes('creditsUsedMicro') &&
  definition.allowedOperationTypes.length > 1
    ? [UsageOperationType.ALL, ...definition.allowedOperationTypes]
    : definition.allowedOperationTypes;
