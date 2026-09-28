import { isDefined } from 'twenty-shared/utils';
import {
  canObjectBeManagedByAutomation,
  isObjectSyncedFromConnectedAccounts,
} from 'twenty-shared/workflow';

import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const canFieldsBeUpdatedByAutomation = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  fieldNames,
  workspaceCustomApplicationId,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  fieldNames: string[];
  workspaceCustomApplicationId: string;
}): boolean => {
  if (
    canObjectBeManagedByAutomation({
      nameSingular: flatObjectMetadata.nameSingular,
    })
  ) {
    return true;
  }

  if (
    !isObjectSyncedFromConnectedAccounts({
      nameSingular: flatObjectMetadata.nameSingular,
    }) ||
    fieldNames.length === 0
  ) {
    return false;
  }

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  return fieldNames.every((fieldName) => {
    const { fieldMetadata } = resolveFilterKeyFieldMetadata({
      filterKey: fieldName,
      fieldIdByName,
      fieldIdByJoinColumnName,
      flatFieldMetadataMaps,
    });

    return (
      isDefined(fieldMetadata) &&
      fieldMetadata.applicationId === workspaceCustomApplicationId
    );
  });
};
