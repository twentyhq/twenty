import { ACCESS_GROUP_COMPACT_ID_COLUMN_NAME } from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

// Outside field metadata because only an identity column guarantees an id is never reused
export const ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION: WorkspaceSchemaColumnDefinition =
  {
    name: ACCESS_GROUP_COMPACT_ID_COLUMN_NAME,
    type: 'integer',
    isNullable: false,
    isGeneratedAlwaysAsIdentity: true,
  };
