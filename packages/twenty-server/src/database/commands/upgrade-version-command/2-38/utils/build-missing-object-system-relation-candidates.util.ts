import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type DefaultRelationHolderNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

export type UnprovisionableSystemRelation = {
  sourceObjectNameSingular: string;
  holderNameSingular: DefaultRelationHolderNameSingular;
  reason: string;
};

export type MissingObjectSystemRelationCandidate = {
  sourceFlatObjectMetadata: FlatObjectMetadata;
  missingHolderNameSingulars: DefaultRelationHolderNameSingular[];
};

export type MissingObjectSystemRelationCandidates = {
  candidates: MissingObjectSystemRelationCandidate[];
  unprovisionableSystemRelations: UnprovisionableSystemRelation[];
};

type BuildMissingObjectSystemRelationCandidatesArgs = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> & {
  holderFlatObjectMetadataByNameSingular: Record<
    DefaultRelationHolderNameSingular,
    FlatObjectMetadata
  >;
  existingColumnNamesByHolderNameSingular: Record<
    DefaultRelationHolderNameSingular,
    Set<string>
  >;
  twentyStandardApplicationUniversalIdentifier: string;
};

export const buildMissingObjectSystemRelationCandidates = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  holderFlatObjectMetadataByNameSingular,
  existingColumnNamesByHolderNameSingular,
  twentyStandardApplicationUniversalIdentifier,
}: BuildMissingObjectSystemRelationCandidatesArgs): MissingObjectSystemRelationCandidates => {
  const holderContexts = DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
    (holderNameSingular) => {
      const holderFlatObjectMetadata =
        holderFlatObjectMetadataByNameSingular[holderNameSingular];
      const holderFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
        holderFlatObjectMetadata,
        flatFieldMetadataMaps,
      );

      return {
        holderNameSingular,
        holderFlatObjectMetadata,
        holderFieldNames: new Set(
          holderFlatFieldMetadatas.map(({ name }) => name),
        ),
        morphTargetObjectMetadataIds: new Set(
          holderFlatFieldMetadatas
            .filter(
              (flatFieldMetadata) =>
                flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
                flatFieldMetadata.morphId ===
                  STANDARD_OBJECTS[holderNameSingular].morphIds.targetMorphId
                    .morphId,
            )
            .map(
              (flatFieldMetadata) =>
                flatFieldMetadata.relationTargetObjectMetadataId,
            )
            .filter(isDefined),
        ),
        existingColumnNames:
          existingColumnNamesByHolderNameSingular[holderNameSingular],
      };
    },
  );

  const candidates: MissingObjectSystemRelationCandidate[] = [];
  const unprovisionableSystemRelations: UnprovisionableSystemRelation[] = [];

  for (const sourceFlatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      sourceFlatObjectMetadata.applicationUniversalIdentifier ===
      twentyStandardApplicationUniversalIdentifier
    ) {
      continue;
    }

    const sourceFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
      sourceFlatObjectMetadata,
      flatFieldMetadataMaps,
    );
    const sourceFieldNames = new Set(
      sourceFlatFieldMetadatas.map(({ name }) => name),
    );
    const missingHolderNameSingulars: DefaultRelationHolderNameSingular[] = [];

    for (const holderContext of holderContexts) {
      const { holderNameSingular, holderFlatObjectMetadata } = holderContext;

      const pushUnprovisionable = (reason: string) =>
        unprovisionableSystemRelations.push({
          sourceObjectNameSingular: sourceFlatObjectMetadata.nameSingular,
          holderNameSingular,
          reason,
        });

      const reverseFieldUniversalIdentifier =
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            sourceFlatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier:
            holderFlatObjectMetadata.universalIdentifier,
          relationTargetObjectUniversalIdentifier:
            sourceFlatObjectMetadata.universalIdentifier,
        });
      const forwardFieldUniversalIdentifier =
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            sourceFlatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier:
            sourceFlatObjectMetadata.universalIdentifier,
          relationTargetObjectUniversalIdentifier:
            holderFlatObjectMetadata.universalIdentifier,
        });

      const reverseFieldExists =
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[
            reverseFieldUniversalIdentifier
          ],
        ) ||
        holderContext.morphTargetObjectMetadataIds.has(
          sourceFlatObjectMetadata.id,
        );
      const forwardFieldExists =
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[
            forwardFieldUniversalIdentifier
          ],
        ) ||
        sourceFlatFieldMetadatas.some(
          (flatFieldMetadata) =>
            flatFieldMetadata.type === FieldMetadataType.RELATION &&
            flatFieldMetadata.name === holderFlatObjectMetadata.namePlural &&
            flatFieldMetadata.relationTargetObjectMetadataId ===
              holderFlatObjectMetadata.id,
        );

      if (reverseFieldExists && forwardFieldExists) {
        continue;
      }

      if (reverseFieldExists || forwardFieldExists) {
        pushUnprovisionable(
          `only the ${
            reverseFieldExists ? 'reverse morph' : 'forward relation'
          } leg of the pair exists; a partial pair cannot be completed automatically`,
        );
        continue;
      }

      const reverseFieldName = `target${capitalize(
        sourceFlatObjectMetadata.nameSingular,
      )}`;

      if (holderContext.holderFieldNames.has(reverseFieldName)) {
        pushUnprovisionable(
          `field "${reverseFieldName}" already exists on ${holderNameSingular}`,
        );
        continue;
      }

      const forwardFieldName = holderFlatObjectMetadata.namePlural;

      if (sourceFieldNames.has(forwardFieldName)) {
        pushUnprovisionable(
          `field "${forwardFieldName}" already exists on ${sourceFlatObjectMetadata.nameSingular}`,
        );
        continue;
      }

      const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
        name: reverseFieldName,
      });

      if (holderContext.existingColumnNames.has(joinColumnName)) {
        pushUnprovisionable(
          `column "${joinColumnName}" already exists on the ${holderNameSingular} table`,
        );
        continue;
      }

      missingHolderNameSingulars.push(holderNameSingular);
    }

    if (missingHolderNameSingulars.length > 0) {
      candidates.push({
        sourceFlatObjectMetadata,
        missingHolderNameSingulars,
      });
    }
  }

  return { candidates, unprovisionableSystemRelations };
};
