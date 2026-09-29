import { getUsageLimitOperationTypes } from '@/settings/billing/utils/getUsageLimitOperationTypes';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const buildDefinition = (
  allowedMeters: string[],
  allowedOperationTypes: UsageOperationType[] = [
    UsageOperationType.AI_CHAT_TOKEN,
    UsageOperationType.WEB_SEARCH,
  ],
) => ({
  __typename: 'UsageQuotaDefinition' as const,
  resourceType: UsageResourceType.AI,
  allowedOperationTypes,
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

  it('skips "all operations" when the resource has a single operation', () => {
    expect(
      getUsageLimitOperationTypes(
        buildDefinition(
          ['creditsUsedMicro', 'quantity'],
          [UsageOperationType.WEB_SEARCH],
        ),
      ),
    ).toEqual([UsageOperationType.WEB_SEARCH]);
  });
});
