import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findLimitsForResource } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-resource.util';

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-id',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'application',
  spenderId: 'application-1',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  unit: UsageUnit.CREDIT,
  limitValue: 1_000_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

describe('findLimitsForResource', () => {
  const aiLimit = buildLimit({ id: 'ai' });
  const workflowLimit = buildLimit({
    id: 'workflow',
    resourceType: UsageResourceType.WORKFLOW,
  });
  const allUsageLimit = buildLimit({
    id: 'all-usage',
    resourceType: UsageResourceType.ALL,
  });

  it('returns the resource limits followed by the all-usage limits', () => {
    expect(
      findLimitsForResource({
        usageLimits: {
          byResourceType: {
            [UsageResourceType.AI]: [aiLimit],
            [UsageResourceType.WORKFLOW]: [workflowLimit],
            [UsageResourceType.ALL]: [allUsageLimit],
          },
        },
        resourceType: UsageResourceType.AI,
      }),
    ).toEqual([aiLimit, allUsageLimit]);
  });

  it('applies the all-usage limits to a resource with no limit of its own', () => {
    expect(
      findLimitsForResource({
        usageLimits: {
          byResourceType: { [UsageResourceType.ALL]: [allUsageLimit] },
        },
        resourceType: UsageResourceType.APP,
      }),
    ).toEqual([allUsageLimit]);
  });

  it('returns only the resource limits when no all-usage limit exists', () => {
    expect(
      findLimitsForResource({
        usageLimits: {
          byResourceType: {
            [UsageResourceType.AI]: [aiLimit],
            [UsageResourceType.WORKFLOW]: [workflowLimit],
          },
        },
        resourceType: UsageResourceType.WORKFLOW,
      }),
    ).toEqual([workflowLimit]);
  });

  it('returns nothing when neither the resource nor all usage has a limit', () => {
    expect(
      findLimitsForResource({
        usageLimits: { byResourceType: {} },
        resourceType: UsageResourceType.EMAIL,
      }),
    ).toEqual([]);
  });
});
