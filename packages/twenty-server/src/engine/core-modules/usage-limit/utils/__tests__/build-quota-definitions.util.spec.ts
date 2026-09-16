import { buildQuotaDefinitions } from 'src/engine/core-modules/usage-limit/utils/build-quota-definitions.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

describe('buildQuotaDefinitions', () => {
  it('exposes one entry per resource and configurable kind that defines one', () => {
    expect(
      buildQuotaDefinitions().map(({ resourceType, limitKind }) => [
        resourceType,
        limitKind,
      ]),
    ).toEqual([
      [UsageResourceType.AI, 'quota'],
      [UsageResourceType.STORAGE, 'stock'],
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

  it('offers a stock over the workspace or one application, metering stored files', () => {
    const stock = buildQuotaDefinitions().find(
      (definition) => definition.limitKind === 'stock',
    );

    expect(stock?.allowedOperationTypes).toEqual([
      UsageOperationType.STORAGE_FILE,
    ]);
    expect(stock?.allowedSpenderTypes).toEqual(['workspace', 'application']);
    expect(stock?.allowedMeters).toEqual(['bytes', 'quantity']);
  });
});
