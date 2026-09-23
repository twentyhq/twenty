import { buildQuotaDefinitions } from 'src/engine/core-modules/usage-limit/utils/build-quota-definitions.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

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

    expect(quota?.allowedOperationTypes.length).toBeGreaterThan(0);
    expect(quota?.allowedSpenderTypes).toContain('workspace');
    expect(quota?.allowedMeters).toContain('creditsUsedMicro');
  });
});
