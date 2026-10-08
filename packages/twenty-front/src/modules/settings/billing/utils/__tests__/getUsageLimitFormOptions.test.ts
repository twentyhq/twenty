import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { getUsageLimitFormOptions } from '@/settings/billing/utils/getUsageLimitFormOptions';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

const DEFINITIONS = {
  definitions: [
    {
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
        {
          operationType: UsageOperationType.WEB_SEARCH,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      operatorOnlyScopes: [],
    },
    {
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      allowedOperations: [
        {
          operationType: UsageOperationType.CODE_EXECUTION,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'application', 'logicFunction'],
      operatorOnlyScopes: [],
    },
    {
      resourceType: UsageResourceType.EMAIL,
      allowedOperations: [
        {
          operationType: UsageOperationType.EMAIL_SEND,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      operatorOnlyScopes: [
        {
          operationType: UsageOperationType.EMAIL_SEND,
          spenderType: 'workspace',
          unit: UsageUnit.INVOCATION,
          periodUnit: 'day',
        },
      ],
    },
  ],
  isIntraWorkspaceLimitEntitled: true,
  hasAllowancePeriod: false,
};

const EMAIL_SEND_VALUES = {
  ...EMPTY_USAGE_LIMIT_FORM_VALUES,
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  unit: UsageUnit.INVOCATION,
};

describe('getUsageLimitFormOptions', () => {
  it('lists resources and nothing else until one is chosen', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: EMPTY_USAGE_LIMIT_FORM_VALUES,
    });

    expect(options.resourceTypes).toEqual([
      UsageResourceType.AI,
      UsageResourceType.LOGIC_FUNCTION,
      UsageResourceType.EMAIL,
    ]);
    expect(options.operationTypes).toEqual([]);
    expect(options.units).toEqual([]);
    expect(options.periodUnits).toEqual([]);
  });

  it('offers the operations in the order the server lists them and only credits for all operations', () => {
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
    expect(options.units).toEqual([UsageUnit.CREDIT]);
    expect(options.spenderTypes).toEqual(['workspace', 'userWorkspace']);
    expect(options.periodUnits).toEqual(['day', 'week', 'month']);
  });

  it('offers the units the chosen operation records', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: {
        ...EMPTY_USAGE_LIMIT_FORM_VALUES,
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.WEB_SEARCH,
      },
    });

    expect(options.units).toEqual([UsageUnit.CREDIT, UsageUnit.INVOCATION]);
  });

  it('offers credits for an all-operations limit on a resource with a single operation', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: {
        ...EMPTY_USAGE_LIMIT_FORM_VALUES,
        resourceType: UsageResourceType.LOGIC_FUNCTION,
        operationType: UsageOperationType.ALL,
      },
    });

    expect(options.units).toEqual([UsageUnit.CREDIT]);
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
  });

  it('leaves out the period of a scope only an operator can set', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: EMAIL_SEND_VALUES,
    });

    expect(options.periodUnits).toEqual(['week', 'month']);
  });

  it('offers that period again in another unit', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: { ...EMAIL_SEND_VALUES, unit: UsageUnit.CREDIT },
    });

    expect(options.periodUnits).toEqual(['day', 'week', 'month']);
  });

  it('offers that period again for a single member', () => {
    const options = getUsageLimitFormOptions({
      definitions: DEFINITIONS,
      values: {
        ...EMAIL_SEND_VALUES,
        spenderType: 'userWorkspace',
        spenderId: 'a3c1b1e2-4f3d-4c5b-9a8e-1f2d3c4b5a6e',
      },
    });

    expect(options.periodUnits).toEqual(['day', 'week', 'month']);
  });
});
