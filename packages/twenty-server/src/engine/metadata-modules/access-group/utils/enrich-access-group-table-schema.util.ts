import { ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-column-definition.constant';
import { ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-index-definition.constant';
import { type WorkspaceTableSchemaDefinitions } from 'src/engine/metadata-modules/access-group/types/workspace-table-schema-definitions.type';
import { isAccessGroupObject } from 'src/engine/metadata-modules/access-group/utils/is-access-group-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const enrichAccessGroupTableSchema = ({
  objectMetadata,
  tableSchema,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  tableSchema: WorkspaceTableSchemaDefinitions;
}): WorkspaceTableSchemaDefinitions =>
  isAccessGroupObject(objectMetadata)
    ? {
        columnDefinitions: [
          ...tableSchema.columnDefinitions,
          ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION,
        ],
        indexDefinitions: [
          ...tableSchema.indexDefinitions,
          ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION,
        ],
      }
    : tableSchema;
