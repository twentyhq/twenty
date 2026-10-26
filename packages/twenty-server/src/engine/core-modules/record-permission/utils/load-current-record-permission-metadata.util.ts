import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type RecordPermissionMetadata } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Hard prohibitions must take effect before the metadata cache refresh finishes.
export const loadCurrentRecordPermissionMetadata = async ({
  dataSource,
  workspaceId,
  metadata,
}: {
  dataSource: DataSource;
  workspaceId: string;
  metadata: RecordPermissionMetadata;
}): Promise<RecordPermissionMetadata> => {
  const currentObjects: Pick<
    FlatObjectMetadata,
    'id' | 'readability' | 'writability' | 'recordCapabilities'
  >[] = await dataSource.query(
    'SELECT id, readability, writability, "recordCapabilities" FROM core."objectMetadata" WHERE "workspaceId" = $1',
    [workspaceId],
  );
  const currentById = new Map(
    currentObjects.map((object) => [object.id, object]),
  );
  const objects = Object.values(
    metadata.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((object) => {
      const current = currentById.get(object.id);
      if (!isDefined(current))
        throw new Error(
          'Record permission object metadata is no longer available',
        );
      return { ...object, ...current };
    });

  return {
    ...metadata,
    flatObjectMetadataMaps: {
      ...metadata.flatObjectMetadataMaps,
      byUniversalIdentifier: Object.fromEntries(
        objects.map((object) => [object.universalIdentifier, object]),
      ),
    },
  };
};
