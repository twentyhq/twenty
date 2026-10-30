import { ACCESS_GROUP_IDS_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-ids-column-definition.constant';
import { type WorkspaceTableSchemaDefinitions } from 'src/engine/metadata-modules/access-group/types/workspace-table-schema-definitions.type';
import { buildAccessGroupIdsIndexDefinition } from 'src/engine/metadata-modules/access-group/utils/build-access-group-ids-index-definition.util';
import { hasAccessGroupIds } from 'src/engine/metadata-modules/access-group/utils/has-access-group-ids.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const enrichRecordTableSchemaWithAccessGroupIds = ({
  objectMetadata,
  tableSchema,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'universalIdentifier'>;
  tableSchema: WorkspaceTableSchemaDefinitions;
}): WorkspaceTableSchemaDefinitions => {
  if (!hasAccessGroupIds(objectMetadata)) {
    return tableSchema;
  }

  return {
    columnDefinitions: [
      ...tableSchema.columnDefinitions,
      ACCESS_GROUP_IDS_COLUMN_DEFINITION,
    ],
    indexDefinitions: [
      ...tableSchema.indexDefinitions,
      buildAccessGroupIdsIndexDefinition({
        objectMetadataId: objectMetadata.id,
      }),
    ],
  };
};
