import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

// Outside field metadata to stay out of APIs, UI and manifests; serves every action; null = not computed
export const ACCESS_GROUP_IDS_COLUMN_DEFINITION: WorkspaceSchemaColumnDefinition =
  {
    name: ACCESS_GROUP_IDS_COLUMN_NAME,
    type: 'integer',
    isArray: true,
  };
