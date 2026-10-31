/* @license Enterprise */

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

// Outside field metadata so no API, view or manifest can read or set it without the sharing rules
export const IS_PRIVATE_COLUMN_DEFINITION: WorkspaceSchemaColumnDefinition = {
  name: IS_PRIVATE_COLUMN_NAME,
  type: 'boolean',
  isNullable: false,
  default: false,
};
