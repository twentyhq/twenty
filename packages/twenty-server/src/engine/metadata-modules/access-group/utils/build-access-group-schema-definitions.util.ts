import { createHash } from 'crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  ACCESS_GROUP_COMPACT_ID_COLUMN_NAME,
  READABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
  WRITABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
} from 'src/engine/metadata-modules/access-group/constants/access-group-column-names.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

type AccessGroupSchemaDefinitions = {
  columnDefinitions: WorkspaceSchemaColumnDefinition[];
  indexDefinitions: WorkspaceSchemaIndexDefinition[];
};

// Keyed on the object id, not the table name, so a renamed object never
// leaves an index name that a new object with the old name would collide with.
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

// These columns are engine-owned: they have no field metadata, so the record
// APIs, the UI and app manifests never see them.
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
    columnDefinitions: [
      READABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
      WRITABLE_BY_ACCESS_GROUP_IDS_COLUMN_NAME,
    ].map((columnName) => ({
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
