/* @license Enterprise */

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

// Partial, so it only holds the few private records a creator or custodian lookup reads
export const buildPrivateRecordIndexDefinition = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}): WorkspaceSchemaIndexDefinition => ({
  name: `IDX_PRIVATE_RECORD_${objectMetadataId.replace(/-/g, '')}`,
  columns: ['id'],
  where: `"${IS_PRIVATE_COLUMN_NAME}"`,
});
