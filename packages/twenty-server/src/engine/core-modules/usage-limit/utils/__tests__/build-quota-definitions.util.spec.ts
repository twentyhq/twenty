import { buildQuotaDefinitions } from 'src/engine/core-modules/usage-limit/utils/build-quota-definitions.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

describe('buildQuotaDefinitions', () => {
  it('exposes only the resources that define a quota', () => {
    const resourceTypes = buildQuotaDefinitions().map(
      (definition) => definition.resourceType,
    );

    expect(resourceTypes).toEqual([UsageResourceType.AI]);
  });

  it('carries the allow lists a form needs to offer a scope', () => {
    const [definition] = buildQuotaDefinitions();

    expect(definition.allowedOperationTypes.length).toBeGreaterThan(0);
    expect(definition.allowedSpenderTypes).toContain('workspace');
    expect(definition.allowedMeters).toContain('creditsUsedMicro');
  });
});
