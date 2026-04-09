import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import type { FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';

export const fromViewSortEntityToFlatViewSort = ({
  entity: viewSortEntity,
  applicationIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'viewSort'>): FlatViewSort => {
  const viewSortEntityWithoutRelations = removePropertiesFromRecord(
    viewSortEntity,
    getMetadataEntityRelationProperties('viewSort'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewSortEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewSortEntity.applicationId} not found for viewSort ${viewSortEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewSortEntity.viewId,
  );

  if (!isDefined(viewUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `View with id ${viewSortEntity.viewId} not found for viewSort ${viewSortEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const fieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(viewSortEntity.fieldMetadataId);

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Field metadata with id ${viewSortEntity.fieldMetadataId} not found for viewSort ${viewSortEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewSortEntityWithoutRelations,
    createdAt: viewSortEntity.createdAt.toISOString(),
    updatedAt: viewSortEntity.updatedAt.toISOString(),
    deletedAt: viewSortEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewSortEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  };
};
