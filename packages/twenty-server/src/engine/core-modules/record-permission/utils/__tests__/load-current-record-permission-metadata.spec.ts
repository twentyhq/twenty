import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';

import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { getRecordCapabilities } from 'src/engine/core-modules/record-permission/utils/get-record-capabilities.util';
import { loadCurrentRecordPermissionMetadata } from 'src/engine/core-modules/record-permission/utils/load-current-record-permission-metadata.util';

describe('Current record capabilities', () => {
  it('enforces a new prohibition while the object cache still allows reads', async () => {
    const { context, objects, rule } = createRecordPermissionTestContext();
    rule.condition = null;
    const currentObjects = Object.values(objects).map((object) => ({
      id: object.id,
      readability: MetadataReadability.OPEN,
      writability: MetadataWritability.OPEN,
      recordCapabilities:
        object.id === objects.company.id ? { read: false } : null,
    }));
    const query = jest.fn().mockResolvedValue(currentObjects);
    const metadata = await loadCurrentRecordPermissionMetadata({
      dataSource: { query } as unknown as DataSource,
      workspaceId: objects.company.workspaceId,
      metadata: context,
    });
    const company =
      metadata.flatObjectMetadataMaps.byUniversalIdentifier[
        objects.company.universalIdentifier
      ]!;
    expect(company.recordCapabilities?.read).toBe(false);
    expect(objects.company.recordCapabilities?.read).not.toBe(false);
    const currentContext = {
      ...context,
      ...metadata,
      capabilitiesByObjectUniversalIdentifier: {
        [company.universalIdentifier]: getRecordCapabilities(company),
      },
    };
    for (const strategy of ['live', 'projected'] as const)
      expect(
        compileRecordPermission({
          context: currentContext,
          objectUniversalIdentifier: company.universalIdentifier,
          tableAlias: 'company',
          action: 'read',
          strategy,
        }).sql,
      ).toBe('FALSE');
    expect(query).toHaveBeenCalledWith(expect.any(String), [
      objects.company.workspaceId,
    ]);
  });

  it('fails closed when cached metadata describes an object that was removed', async () => {
    const { context, objects } = createRecordPermissionTestContext();
    await expect(
      loadCurrentRecordPermissionMetadata({
        dataSource: {
          query: jest.fn().mockResolvedValue([]),
        } as unknown as DataSource,
        workspaceId: objects.company.workspaceId,
        metadata: context,
      }),
    ).rejects.toThrow('no longer available');
  });
});
