import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type UnprovisionableAgentChatThreadTargetRelation = {
  objectNameSingular: string;
  reason: string;
};

export type ObjectsMissingAgentChatThreadTargetRelation = {
  flatObjectMetadatas: FlatObjectMetadata[];
  unprovisionableRelations: UnprovisionableAgentChatThreadTargetRelation[];
};

type FindObjectsMissingAgentChatThreadTargetRelationArgs = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> & {
  targetFlatObjectMetadata: FlatObjectMetadata;
  existingTargetColumnNames: Set<string>;
  twentyStandardApplicationUniversalIdentifier: string;
};

// Objects created before agentChatThreadTarget existed never got the relation
// object creation now gives them. The rules are the 2-38 backfill's for the
// default relations: a pair is provisioned only when both of its fields are
// absent, and one that cannot be completed safely is reported, not guessed.
export const findObjectsMissingAgentChatThreadTargetRelation = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  targetFlatObjectMetadata,
  existingTargetColumnNames,
  twentyStandardApplicationUniversalIdentifier,
}: FindObjectsMissingAgentChatThreadTargetRelationArgs): ObjectsMissingAgentChatThreadTargetRelation => {
  const targetFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const targetFieldNames = new Set(
    targetFlatFieldMetadatas.map(({ name }) => name),
  );
  const morphTargetObjectMetadataIds = new Set(
    targetFlatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
          flatFieldMetadata.morphId ===
            STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId
              .morphId,
      )
      .map(
        (flatFieldMetadata) => flatFieldMetadata.relationTargetObjectMetadataId,
      )
      .filter(isDefined),
  );

  const flatObjectMetadatas: FlatObjectMetadata[] = [];
  const unprovisionableRelations: UnprovisionableAgentChatThreadTargetRelation[] =
    [];

  for (const sourceFlatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      sourceFlatObjectMetadata.applicationUniversalIdentifier ===
      twentyStandardApplicationUniversalIdentifier
    ) {
      continue;
    }

    const pushUnprovisionable = (reason: string) =>
      unprovisionableRelations.push({
        objectNameSingular: sourceFlatObjectMetadata.nameSingular,
        reason,
      });

    const sourceFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
      sourceFlatObjectMetadata,
      flatFieldMetadataMaps,
    );

    const reverseFieldExists =
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          getSystemRelationFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              sourceFlatObjectMetadata.applicationUniversalIdentifier,
            objectUniversalIdentifier:
              targetFlatObjectMetadata.universalIdentifier,
            relationTargetObjectUniversalIdentifier:
              sourceFlatObjectMetadata.universalIdentifier,
          })
        ],
      ) || morphTargetObjectMetadataIds.has(sourceFlatObjectMetadata.id);
    const forwardFieldExists =
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          getSystemRelationFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              sourceFlatObjectMetadata.applicationUniversalIdentifier,
            objectUniversalIdentifier:
              sourceFlatObjectMetadata.universalIdentifier,
            relationTargetObjectUniversalIdentifier:
              targetFlatObjectMetadata.universalIdentifier,
          })
        ],
      ) ||
      sourceFlatFieldMetadatas.some(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.RELATION &&
          flatFieldMetadata.name === targetFlatObjectMetadata.namePlural &&
          flatFieldMetadata.relationTargetObjectMetadataId ===
            targetFlatObjectMetadata.id,
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

    if (targetFieldNames.has(reverseFieldName)) {
      pushUnprovisionable(
        `field "${reverseFieldName}" already exists on ${targetFlatObjectMetadata.nameSingular}`,
      );
      continue;
    }

    const forwardFieldName = targetFlatObjectMetadata.namePlural;

    if (sourceFlatFieldMetadatas.some(({ name }) => name === forwardFieldName)) {
      pushUnprovisionable(
        `field "${forwardFieldName}" already exists on ${sourceFlatObjectMetadata.nameSingular}`,
      );
      continue;
    }

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: reverseFieldName,
    });

    if (existingTargetColumnNames.has(joinColumnName)) {
      pushUnprovisionable(
        `column "${joinColumnName}" already exists on the ${targetFlatObjectMetadata.nameSingular} table`,
      );
      continue;
    }

    flatObjectMetadatas.push(sourceFlatObjectMetadata);
  }

  return { flatObjectMetadatas, unprovisionableRelations };
};
