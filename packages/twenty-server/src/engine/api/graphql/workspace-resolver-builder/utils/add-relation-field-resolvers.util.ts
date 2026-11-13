import { isObjectType, type GraphQLSchema } from 'graphql';
import { getNodeTypename, isDefined } from 'twenty-shared/utils';

import { computeRelationRecordKey } from 'src/engine/api/common/utils/relation-record-key.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// The default resolver reads parent[fieldName], so an alias would return the unaliased relation
export const addRelationFieldResolvers = ({
  schema,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  schema: GraphQLSchema;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const objectType = schema.getType(
      getNodeTypename(flatObjectMetadata.nameSingular),
    );

    if (!isObjectType(objectType)) {
      continue;
    }

    const graphqlFields = objectType.getFields();

    for (const fieldId of flatObjectMetadata.fieldIds) {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      const graphqlField = isDefined(flatFieldMetadata)
        ? graphqlFields[flatFieldMetadata.name]
        : undefined;

      if (
        !isDefined(flatFieldMetadata) ||
        !isDefined(graphqlField) ||
        !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
      ) {
        continue;
      }

      graphqlField.resolve = (parent: Record<string, unknown>, _, __, info) =>
        parent[
          computeRelationRecordKey({
            fieldName: info.fieldName,
            responseKey: String(info.path.key),
          })
        ] ?? parent[info.fieldName];
    }
  }
};
