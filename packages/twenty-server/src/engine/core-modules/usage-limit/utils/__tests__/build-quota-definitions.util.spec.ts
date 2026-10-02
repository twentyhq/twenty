import { buildQuotaDefinitions } from 'src/engine/core-modules/usage-limit/utils/build-quota-definitions.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const findQuotaDefinition = (resourceType: UsageResourceType) =>
  buildQuotaDefinitions().find(
    (definition) => definition.resourceType === resourceType,
  );

describe('buildQuotaDefinitions', () => {
  it('exposes only resources with quota definitions', () => {
    expect(
      buildQuotaDefinitions().map(({ resourceType, limitKind }) => [
        resourceType,
        limitKind,
      ]),
    ).toEqual([
      [UsageResourceType.AI, 'quota'],
      [UsageResourceType.WORKFLOW, 'quota'],
      [UsageResourceType.LOGIC_FUNCTION, 'quota'],
      [UsageResourceType.EMAIL, 'quota'],
    ]);
  });

  it('carries the allow lists a form needs to offer a scope', () => {
    const quota = buildQuotaDefinitions().find(
      (definition) => definition.limitKind === 'quota',
    );

    expect(quota?.allowedOperations.length).toBeGreaterThan(0);
    expect(quota?.allowedSpenderTypes).toContain('workspace');
  });

  it('lists every operation first, counted in credits only, when a resource has several', () => {
    expect(
      findQuotaDefinition(UsageResourceType.AI)?.allowedOperations,
    ).toEqual([
      {
        operationType: UsageOperationType.ALL,
        allowedUnits: [UsageUnit.CREDIT],
      },
      {
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
      },
      {
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
        allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
      },
      {
        operationType: UsageOperationType.WEB_SEARCH,
        allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
      },
    ]);
  });

  it('offers credits, runs and runtime on code execution, with no every-operation entry', () => {
    expect(
      findQuotaDefinition(UsageResourceType.LOGIC_FUNCTION)?.allowedOperations,
    ).toEqual([
      {
        operationType: UsageOperationType.CODE_EXECUTION,
        allowedUnits: [
          UsageUnit.CREDIT,
          UsageUnit.INVOCATION,
          UsageUnit.MILLISECOND,
        ],
      },
    ]);
  });
});
