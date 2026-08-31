import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getFieldRelations } from '@/object-record/record-field/ui/utils/junction/getFieldRelations';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { isValidJunctionTargetField } from '@/object-record/record-field/ui/utils/junction/isValidJunctionTargetField';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ReverseJunctionConfig = ValidJunctionConfig & {
  isConfiguredOnOwningSide: boolean;
};

type ReverseJunctionConfigResolution =
  | { status: 'resolved'; junctionConfig: ReverseJunctionConfig }
  | { status: 'ambiguous' }
  | { status: 'invalid' }
  | { status: 'not-found' };

type ResolveReverseJunctionConfigArgs = {
  junctionObjectMetadataId?: string;
  relationTargetFieldMetadataId?: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

type ReverseJunctionConfigCandidate = {
  junctionConfig: ReverseJunctionConfig;
  owningObjectMetadataId: string;
};

const collapseCompatibleMorphSiblingCandidates = (
  candidates: ReverseJunctionConfigCandidate[],
): ReverseJunctionConfig | null => {
  const firstCandidate = candidates[0];
  const firstTargetField = firstCandidate?.junctionConfig.targetFields[0];

  if (
    !isDefined(firstCandidate) ||
    candidates.length < 2 ||
    firstCandidate.junctionConfig.targetFields.length !== 1 ||
    firstTargetField?.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return null;
  }

  const owningObjectMetadataIds = new Set(
    candidates.map(({ owningObjectMetadataId }) => owningObjectMetadataId),
  );
  const morphTargetObjectMetadataIds =
    getTargetObjectMetadataIdsFromField(firstTargetField);

  const areCompatibleMorphSiblings =
    owningObjectMetadataIds.size === candidates.length &&
    candidates.every(
      ({ junctionConfig, owningObjectMetadataId }) =>
        junctionConfig.junctionObjectMetadata.id ===
          firstCandidate.junctionConfig.junctionObjectMetadata.id &&
        junctionConfig.sourceField?.id ===
          firstCandidate.junctionConfig.sourceField?.id &&
        junctionConfig.targetFields.length === 1 &&
        junctionConfig.targetFields[0].id === firstTargetField.id &&
        junctionConfig.isMorphRelation &&
        morphTargetObjectMetadataIds.includes(owningObjectMetadataId),
    );

  return areCompatibleMorphSiblings ? firstCandidate.junctionConfig : null;
};

// Only the owning side of a junction carries the junction settings, so reaching the owner
// from one of its targets means looking for the object whose junction field points here.
export const resolveReverseJunctionConfig = ({
  junctionObjectMetadataId,
  relationTargetFieldMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
}: ResolveReverseJunctionConfigArgs): ReverseJunctionConfigResolution => {
  if (
    !isDefined(junctionObjectMetadataId) ||
    !isDefined(relationTargetFieldMetadataId) ||
    !isDefined(sourceObjectMetadataId)
  ) {
    return { status: 'not-found' };
  }

  const reverseJunctionConfigCandidates: ReverseJunctionConfigCandidate[] = [];
  let hasInvalidConfiguredCandidate = false;
  let hasInvalidCandidateForRequestedReverse = false;

  for (const relatedObjectMetadata of objectMetadataItems) {
    for (const forwardJunctionField of relatedObjectMetadata.fields) {
      const relationsTargetingJunction = getFieldRelations(
        forwardJunctionField,
      ).filter(
        (relation) =>
          relation.targetObjectMetadata.id === junctionObjectMetadataId,
      );

      for (const relationTargetingJunction of relationsTargetingJunction) {
        const junctionConfig = getJunctionConfig({
          settings: forwardJunctionField.settings,
          relationObjectMetadataId: junctionObjectMetadataId,
          relationTargetFieldMetadataId:
            relationTargetingJunction.targetFieldMetadata.id,
          sourceObjectMetadataId: relatedObjectMetadata.id,
          objectMetadataItems,
        });

        const isConfiguredOnOwningSide = hasJunctionTargetFieldId(
          forwardJunctionField.settings,
        );
        const isConfiguredForRequestedReverse =
          isConfiguredOnOwningSide &&
          forwardJunctionField.settings.junctionTargetFieldId ===
            relationTargetFieldMetadataId;

        if (
          !isUsableJunctionConfig(junctionConfig) ||
          !isDefined(junctionConfig.sourceField)
        ) {
          hasInvalidConfiguredCandidate ||= isConfiguredOnOwningSide;
          hasInvalidCandidateForRequestedReverse ||=
            isConfiguredForRequestedReverse;
          continue;
        }

        const targetsRequestedReverse = junctionConfig.targetFields.some(
          (targetField) => targetField.id === relationTargetFieldMetadataId,
        );

        if (
          !getTargetObjectMetadataIdsFromField(
            junctionConfig.sourceField,
          ).includes(relatedObjectMetadata.id)
        ) {
          hasInvalidConfiguredCandidate ||= isConfiguredOnOwningSide;
          hasInvalidCandidateForRequestedReverse ||=
            isConfiguredForRequestedReverse || targetsRequestedReverse;
          continue;
        }

        const reverseSourceField = junctionConfig.targetFields.find(
          (targetField) => targetField.id === relationTargetFieldMetadataId,
        );

        if (!isDefined(reverseSourceField)) {
          continue;
        }

        if (
          !getTargetObjectMetadataIdsFromField(reverseSourceField).includes(
            sourceObjectMetadataId,
          ) ||
          !isValidJunctionTargetField({
            fieldMetadataItem: junctionConfig.sourceField,
            sourceFieldMetadataId: reverseSourceField.id,
          })
        ) {
          hasInvalidConfiguredCandidate ||= isConfiguredOnOwningSide;
          hasInvalidCandidateForRequestedReverse = true;
          continue;
        }

        reverseJunctionConfigCandidates.push({
          junctionConfig: {
            junctionObjectMetadata: junctionConfig.junctionObjectMetadata,
            sourceField: reverseSourceField,
            targetFields: [junctionConfig.sourceField],
            isMorphRelation:
              junctionConfig.sourceField.type ===
              FieldMetadataType.MORPH_RELATION,
            isValid: true,
            isConfiguredOnOwningSide,
          },
          owningObjectMetadataId: relatedObjectMetadata.id,
        });
      }
    }
  }

  const configuredReverseJunctionConfigCandidates =
    reverseJunctionConfigCandidates.filter(
      ({ junctionConfig }) => junctionConfig.isConfiguredOnOwningSide,
    );

  if (configuredReverseJunctionConfigCandidates.length > 0) {
    if (configuredReverseJunctionConfigCandidates.length === 1) {
      return {
        status: 'resolved',
        junctionConfig:
          configuredReverseJunctionConfigCandidates[0].junctionConfig,
      };
    }

    const compatibleConfiguredMorphSiblingConfig =
      collapseCompatibleMorphSiblingCandidates(
        configuredReverseJunctionConfigCandidates,
      );

    return isDefined(compatibleConfiguredMorphSiblingConfig)
      ? {
          status: 'resolved',
          junctionConfig: compatibleConfiguredMorphSiblingConfig,
        }
      : { status: 'ambiguous' };
  }

  if (hasInvalidCandidateForRequestedReverse) {
    return { status: 'invalid' };
  }

  if (reverseJunctionConfigCandidates.length > 1) {
    const compatibleMorphSiblingConfig =
      collapseCompatibleMorphSiblingCandidates(reverseJunctionConfigCandidates);

    return isDefined(compatibleMorphSiblingConfig)
      ? {
          status: 'resolved',
          junctionConfig: compatibleMorphSiblingConfig,
        }
      : { status: 'ambiguous' };
  }

  if (reverseJunctionConfigCandidates.length === 1) {
    return {
      status: 'resolved',
      junctionConfig: reverseJunctionConfigCandidates[0].junctionConfig,
    };
  }

  return hasInvalidConfiguredCandidate
    ? { status: 'invalid' }
    : { status: 'not-found' };
};
