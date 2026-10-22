import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { buildUsageLimitFormValuesFromPreset } from '@/settings/billing/utils/buildUsageLimitFormValuesFromPreset';
import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

type UsageQuotaDefinitions =
  UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];
type OperatorOnlyScopes =
  UsageQuotaDefinitions['definitions'][number]['operatorOnlyScopes'];

const AI_DEFINITION = {
  resourceType: UsageResourceType.AI,
  allowedOperations: [
    {
      operationType: UsageOperationType.ALL,
      allowedUnits: [UsageUnit.CREDIT],
    },
    {
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
    },
  ],
  allowedSpenderTypes: ['workspace', 'userWorkspace'],
  operatorOnlyScopes: [],
};

const buildDefinitions = (
  operatorOnlyScopes: OperatorOnlyScopes = [],
): UsageQuotaDefinitions => ({
  definitions: [{ ...AI_DEFINITION, operatorOnlyScopes }],
  isIntraWorkspaceLimitEntitled: true,
  hasAllowancePeriod: false,
});

describe('buildUsageLimitFormValuesFromPreset', () => {
  it('prefills the form from a known preset', () => {
    expect(
      buildUsageLimitFormValuesFromPreset({
        definitions: buildDefinitions(),
        presetId: 'aiCredits',
      }),
    ).toEqual({
      ...EMPTY_USAGE_LIMIT_FORM_VALUES,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      spenderType: 'workspace',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
    });
  });

  it('starts empty without a preset or with an unknown one', () => {
    for (const presetId of [null, 'unknown', 'toString']) {
      expect(
        buildUsageLimitFormValuesFromPreset({
          definitions: buildDefinitions(),
          presetId,
        }),
      ).toEqual(EMPTY_USAGE_LIMIT_FORM_VALUES);
    }
  });

  it('starts empty when the preset usage is not offered', () => {
    expect(
      buildUsageLimitFormValuesFromPreset({
        definitions: buildDefinitions(),
        presetId: 'workflowCredits',
      }),
    ).toEqual(EMPTY_USAGE_LIMIT_FORM_VALUES);
  });

  it('starts empty when the preset period is reserved to the operator', () => {
    expect(
      buildUsageLimitFormValuesFromPreset({
        definitions: buildDefinitions([
          {
            operationType: UsageOperationType.ALL,
            spenderType: 'workspace',
            unit: UsageUnit.CREDIT,
            periodUnit: 'month',
          },
        ]),
        presetId: 'aiCredits',
      }),
    ).toEqual(EMPTY_USAGE_LIMIT_FORM_VALUES);
  });
});
