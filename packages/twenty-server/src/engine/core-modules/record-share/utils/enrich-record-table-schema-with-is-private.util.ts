/* @license Enterprise */

import { IS_PRIVATE_COLUMN_DEFINITION } from 'src/engine/core-modules/record-share/constants/is-private-column-definition.constant';
import { hasIsPrivateColumn } from 'src/engine/core-modules/record-share/utils/has-is-private-column.util';
import { type WorkspaceTableSchemaDefinitions } from 'src/engine/metadata-modules/access-group/types/workspace-table-schema-definitions.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const enrichRecordTableSchemaWithIsPrivate = ({
  objectMetadata,
  tableSchema,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  tableSchema: WorkspaceTableSchemaDefinitions;
}): WorkspaceTableSchemaDefinitions => {
  if (!hasIsPrivateColumn(objectMetadata)) {
    return tableSchema;
  }

  return {
    ...tableSchema,
    columnDefinitions: [
      ...tableSchema.columnDefinitions,
      IS_PRIVATE_COLUMN_DEFINITION,
    ],
  };
};
