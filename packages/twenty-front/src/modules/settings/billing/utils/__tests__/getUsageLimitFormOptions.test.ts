import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { getUsageLimitFormOptions } from '@/settings/billing/utils/getUsageLimitFormOptions';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const DEFINITIONS = {
  definitions: [
    {
      resourceType: UsageResourceType.AI,
      allowedOperationTypes: [
        UsageOperationType.AI_CHAT_TOKEN,
        UsageOperationType.WEB_SEARCH,
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
    },
  ],
  isIntraWorkspaceLimitEntitled: true,
  hasAllowancePeriod: false,
};

describe('getUsageLimitFormOptions', () => {
  it('lists resources and nothing else until one is chosen', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: EMPTY_USAGE_LIMIT_FORM_VALUES,
    });

    expect(options.resourceTypes).toEqual([UsageResourceType.AI]);
    expect(options.operationTypes).toEqual([]);
    expect(options.periodUnits).toEqual([]);
  });

  it('offers "all operations" to credit quotas and pins their meter', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: {
        ...EMPTY_USAGE_LIMIT_FORM_VALUES,
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.ALL,
      },
    });

    expect(options.operationTypes).toEqual([
      UsageOperationType.ALL,
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ]);
    expect(options.meters).toEqual(['creditsUsedMicro']);
    expect(options.spenderTypes).toEqual(['workspace', 'userWorkspace']);
    expect(options.periodUnits).toEqual(['day', 'week', 'month']);
  });

  it('adds the billing period once the workspace has one', () => {
    const options = getUsageLimitFormOptions({
      definitions: { ...DEFINITIONS, hasAllowancePeriod: true },
      values: {
        ...EMPTY_USAGE_LIMIT_FORM_VALUES,
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.WEB_SEARCH,
      },
    });

    expect(options.periodUnits).toEqual([
      'day',
      'week',
      'month',
      'allowancePeriod',
    ]);
    expect(options.meters).toEqual(['creditsUsedMicro', 'quantity']);
  });
});
