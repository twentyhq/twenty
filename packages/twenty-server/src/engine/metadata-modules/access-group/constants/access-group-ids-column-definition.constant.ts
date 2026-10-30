import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

// No field metadata on purpose: keeps it out of the record APIs, the UI and app manifests.
// Actions live on each group's grant, so one array serves every action; null means not computed yet.
export const ACCESS_GROUP_IDS_COLUMN_DEFINITION: WorkspaceSchemaColumnDefinition =
  {
    name: ACCESS_GROUP_IDS_COLUMN_NAME,
    type: 'integer',
    isArray: true,
  };
