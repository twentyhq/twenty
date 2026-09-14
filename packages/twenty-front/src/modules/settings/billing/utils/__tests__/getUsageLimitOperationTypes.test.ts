import { getUsageLimitOperationTypes } from '@/settings/billing/utils/getUsageLimitOperationTypes';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const buildDefinition = (allowedMeters: string[]) => ({
  __typename: 'UsageQuotaDefinition' as const,
  resourceType: UsageResourceType.AI,
  allowedOperationTypes: [
    UsageOperationType.AI_CHAT_TOKEN,
    UsageOperationType.WEB_SEARCH,
  ],
  allowedSpenderTypes: ['workspace'],
  allowedMeters,
});

describe('getUsageLimitOperationTypes', () => {
  it('offers "all operations" first when the resource is metered in credits', () => {
    expect(
      getUsageLimitOperationTypes(
        buildDefinition(['creditsUsedMicro', 'quantity']),
      ),
    ).toEqual([
      UsageOperationType.ALL,
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ]);
  });

  it('lists only the real operations without a credits meter', () => {
    expect(getUsageLimitOperationTypes(buildDefinition(['quantity']))).toEqual([
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ]);
  });
});
