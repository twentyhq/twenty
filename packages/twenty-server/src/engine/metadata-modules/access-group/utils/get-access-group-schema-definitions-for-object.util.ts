import { ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-column-definition.constant';
import { ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-index-definition.constant';
import { ACCESS_GROUP_IDS_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-ids-column-definition.constant';
import { buildAccessGroupIdsIndexDefinition } from 'src/engine/metadata-modules/access-group/utils/build-access-group-ids-index-definition.util';
import { isAccessGroupObject } from 'src/engine/metadata-modules/access-group/utils/is-access-group-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

export const getAccessGroupSchemaDefinitionsForObject = ({
  objectMetadata,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'universalIdentifier'>;
}): {
  columnDefinition: WorkspaceSchemaColumnDefinition;
  indexDefinition: WorkspaceSchemaIndexDefinition;
} =>
  isAccessGroupObject(objectMetadata)
    ? {
        columnDefinition: ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION,
        indexDefinition: ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION,
      }
    : {
        columnDefinition: ACCESS_GROUP_IDS_COLUMN_DEFINITION,
        indexDefinition: buildAccessGroupIdsIndexDefinition({
          objectMetadataId: objectMetadata.id,
        }),
      };
