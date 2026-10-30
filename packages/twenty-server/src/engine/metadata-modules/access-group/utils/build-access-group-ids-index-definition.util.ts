import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

// Named after the object id, not the table, so a renamed object's index cannot collide with a new object's
export const buildAccessGroupIdsIndexDefinition = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}): WorkspaceSchemaIndexDefinition => ({
  name: `IDX_ACCESS_GROUP_IDS_${objectMetadataId.replace(/-/g, '')}`,
  columns: [ACCESS_GROUP_IDS_COLUMN_NAME],
  type: 'GIN',
});
