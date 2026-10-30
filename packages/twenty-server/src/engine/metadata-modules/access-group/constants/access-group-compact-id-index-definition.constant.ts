import { ACCESS_GROUP_COMPACT_ID_COLUMN_NAME } from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

export const ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION: WorkspaceSchemaIndexDefinition =
  {
    name: 'IDX_ACCESS_GROUP_COMPACT_ID_UNIQUE',
    columns: [ACCESS_GROUP_COMPACT_ID_COLUMN_NAME],
    isUnique: true,
  };
