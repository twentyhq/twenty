import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';

import { type StoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';

// Derived from the bindings, which name every field a stored formula reads
export const buildStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): StoredFormulaWatchPlans => {
  const watchedFieldNamesByPlanKey = new Map<
    string,
    {
      relatedObjectMetadataId: string;
      objectMetadataId: string;
      joinColumnName: string;
      watchedFieldNames: Set<string>;
    }
  >();
  const watchedOwnFieldNamesByObjectMetadataId: Record<
    string,
    Set<string>
  > = {};
  const findBoundFlatFieldMetadata = (universalIdentifier: string) =>
    findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier,
    });

  for (const { objectMetadataId, settings } of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (getFieldMetadataFormulaEvaluation({ settings }) !== 'STORED') {
      continue;
    }

    const bindings = getFieldMetadataFormulaBindings({ settings }) ?? {};
    const watchedOwnFieldNames = (watchedOwnFieldNamesByObjectMetadataId[
      objectMetadataId
    ] ??= new Set());

    for (const [path, universalIdentifier] of Object.entries(bindings)) {
      const [rootSegment, memberSegment] = path.split('.');
      const rootUniversalIdentifier = isDefined(rootSegment)
        ? bindings[rootSegment]
        : undefined;
      const aggregatedRelation = isDefined(rootUniversalIdentifier)
        ? resolveFormulaAggregatedRelation({
            relationFlatFieldMetadata: findBoundFlatFieldMetadata(
              rootUniversalIdentifier,
            ),
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          })
        : undefined;
      const boundFieldName =
        findBoundFlatFieldMetadata(universalIdentifier)?.name;

      if (!isDefined(aggregatedRelation)) {
        if (!isDefined(memberSegment) && isDefined(boundFieldName)) {
          watchedOwnFieldNames.add(boundFieldName);
        }

        continue;
      }

      const { relatedFlatObjectMetadata, joinColumnName } = aggregatedRelation;
      const planKey = `${relatedFlatObjectMetadata.id}:${objectMetadataId}:${joinColumnName}`;
      const plan = watchedFieldNamesByPlanKey.get(planKey) ?? {
        relatedObjectMetadataId: relatedFlatObjectMetadata.id,
        objectMetadataId,
        joinColumnName,
        watchedFieldNames: new Set([joinColumnName]),
      };

      if (isDefined(memberSegment) && isDefined(boundFieldName)) {
        plan.watchedFieldNames.add(boundFieldName);
      }

      watchedFieldNamesByPlanKey.set(planKey, plan);
    }
  }

  const relatedRecordWatchPlansByObjectMetadataId: StoredFormulaWatchPlans['relatedRecordWatchPlansByObjectMetadataId'] =
    {};

  for (const {
    relatedObjectMetadataId,
    objectMetadataId,
    joinColumnName,
    watchedFieldNames,
  } of watchedFieldNamesByPlanKey.values()) {
    relatedRecordWatchPlansByObjectMetadataId[relatedObjectMetadataId] = [
      ...(relatedRecordWatchPlansByObjectMetadataId[relatedObjectMetadataId] ??
        []),
      {
        objectMetadataId,
        joinColumnName,
        watchedFieldNames: [...watchedFieldNames],
      },
    ];
  }

  return {
    relatedRecordWatchPlansByObjectMetadataId,
    watchedOwnFieldNamesByObjectMetadataId: Object.fromEntries(
      Object.entries(watchedOwnFieldNamesByObjectMetadataId).map(
        ([objectMetadataId, watchedOwnFieldNames]) => [
          objectMetadataId,
          [...watchedOwnFieldNames],
        ],
      ),
    ),
  };
};
