import { createHash } from 'crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  ACCESS_GROUP_COMPACT_ID_COLUMN_NAME,
  ACCESS_GROUP_RECORD_COLUMN_NAMES,
  READABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
} from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

type AccessGroupSchemaDefinitions = {
  columnDefinitions: WorkspaceSchemaColumnDefinition[];
  indexDefinitions: WorkspaceSchemaIndexDefinition[];
};

// Keyed on the object id so a renamed object's index cannot collide with a new object's
const computeAccessGroupIndexName = ({
  objectMetadataId,
  columnName,
}: {
  objectMetadataId: string;
  columnName: string;
}): string =>
  `IDX_ACCESS_GROUP_${createHash('sha256')
    .update(objectMetadataId)
    .update(columnName)
    .digest('hex')
    .slice(0, 27)}`;

// No field metadata on purpose: keeps them out of the record APIs, the UI and app manifests
export const buildAccessGroupSchemaDefinitions = ({
  objectMetadata,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'universalIdentifier'>;
}): AccessGroupSchemaDefinitions => {
  if (
    objectMetadata.universalIdentifier ===
    STANDARD_OBJECTS.accessGroup.universalIdentifier
  ) {
    return {
      columnDefinitions: [
        {
          name: ACCESS_GROUP_COMPACT_ID_COLUMN_NAME,
          type: 'integer',
          isNullable: false,
          isGeneratedAlwaysAsIdentity: true,
        },
      ],
      indexDefinitions: [
        {
          name: computeAccessGroupIndexName({
            objectMetadataId: objectMetadata.id,
            columnName: ACCESS_GROUP_COMPACT_ID_COLUMN_NAME,
          }),
          columns: [ACCESS_GROUP_COMPACT_ID_COLUMN_NAME],
          isUnique: true,
        },
      ],
    };
  }

  return {
    columnDefinitions: ACCESS_GROUP_RECORD_COLUMN_NAMES.map((columnName) => ({
      name: columnName,
      type: 'integer',
      isArray: true,
      isNullable: false,
      default: "'{}'",
    })),
    indexDefinitions: [
      {
        name: computeAccessGroupIndexName({
          objectMetadataId: objectMetadata.id,
          columnName: READABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
        }),
        columns: [READABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME],
        type: 'GIN',
      },
    ],
  };
};
