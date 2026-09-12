import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { getFieldRelations } from '@/object-record/record-field/ui/utils/junction/getFieldRelations';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
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

const matchesFieldId = (field: FieldMetadataItem, fieldMetadataId: string) =>
  doesFieldMetadataItemMatchFieldMetadataId({
    fieldMetadataItem: field,
    fieldMetadataId,
  });

const findFieldById = (fields: FieldMetadataItem[], fieldMetadataId: string) =>
  fields.find((field) => matchesFieldId(field, fieldMetadataId));

const findRelationByFieldId = (
  field: FieldMetadataItem,
  fieldMetadataId: string,
  targetObjectMetadataId: string,
) =>
  getFieldRelations(field).find(
    (relation) =>
      relation.targetObjectMetadata.id === targetObjectMetadataId &&
      (field.id === fieldMetadataId ||
        relation.sourceFieldMetadata.id === fieldMetadataId),
  );

const findReciprocalField = ({
  junctionField,
  junctionRelation,
  junctionObjectMetadataId,
  objectMetadataItems,
}: {
  junctionField: FieldMetadataItem;
  junctionRelation: FieldMetadataItemRelation;
  junctionObjectMetadataId: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
}) => {
  const objectMetadataItem = objectMetadataItems.find(
    ({ id }) => id === junctionRelation.targetObjectMetadata.id,
  );
  const fieldMetadataItem = isDefined(objectMetadataItem)
    ? findFieldById(
        objectMetadataItem.fields,
        junctionRelation.targetFieldMetadata.id,
      )
    : undefined;
  const reciprocalRelation = isDefined(fieldMetadataItem)
    ? findRelationByFieldId(
        fieldMetadataItem,
        junctionRelation.targetFieldMetadata.id,
        junctionObjectMetadataId,
      )
    : undefined;

  return isDefined(objectMetadataItem) &&
    isDefined(fieldMetadataItem) &&
    isDefined(reciprocalRelation) &&
    junctionRelation.sourceObjectMetadata.id === junctionObjectMetadataId &&
    reciprocalRelation.sourceObjectMetadata.id === objectMetadataItem.id &&
    matchesFieldId(junctionField, reciprocalRelation.targetFieldMetadata.id)
    ? { objectMetadataItem, fieldMetadataItem }
    : undefined;
};

// Junction relation metadata already names its inverse field. Following those
// edges keeps unrelated fields elsewhere in the workspace out of resolution.
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

  const junctionObjectMetadata = objectMetadataItems.find(
    ({ id }) => id === junctionObjectMetadataId,
  );
  const reverseSourceField = isDefined(junctionObjectMetadata)
    ? findFieldById(
        junctionObjectMetadata.fields,
        relationTargetFieldMetadataId,
      )
    : undefined;

  if (!isDefined(junctionObjectMetadata) || !isDefined(reverseSourceField)) {
    return { status: 'not-found' };
  }

  const declaredInverseEdges = junctionObjectMetadata.fields.flatMap(
    (targetField) =>
      targetField.id === reverseSourceField.id
        ? []
        : getFieldRelations(targetField).map((relation) => ({
            targetField,
            relation,
            owner: findReciprocalField({
              junctionField: targetField,
              junctionRelation: relation,
              junctionObjectMetadataId,
              objectMetadataItems,
            }),
          })),
  );

  if (!isValidJunctionTargetField({ fieldMetadataItem: reverseSourceField })) {
    const hasConfiguredOwner = declaredInverseEdges.some(
      ({ owner }) =>
        isDefined(owner) &&
        hasJunctionTargetFieldId(owner.fieldMetadataItem.settings) &&
        matchesFieldId(
          reverseSourceField,
          owner.fieldMetadataItem.settings.junctionTargetFieldId,
        ),
    );

    return hasConfiguredOwner ? { status: 'invalid' } : { status: 'not-found' };
  }

  const reverseSourceRelation = findRelationByFieldId(
    reverseSourceField,
    relationTargetFieldMetadataId,
    sourceObjectMetadataId,
  );

  if (!isDefined(reverseSourceRelation)) {
    return { status: 'invalid' };
  }

  if (
    !isDefined(
      findReciprocalField({
        junctionField: reverseSourceField,
        junctionRelation: reverseSourceRelation,
        junctionObjectMetadataId,
        objectMetadataItems,
      }),
    )
  ) {
    return { status: 'invalid' };
  }

  const configuredCandidates = new Map<string, ReverseJunctionConfig>();
  const inferredCandidates = new Map<string, ReverseJunctionConfig>();
  let hasInvalidConfiguredCandidate = false;
  let hasInvalidConfiguredCandidateForRequestedReverse = false;
  let hasBrokenDeclaredInverseEdge = false;

  for (const { targetField, relation, owner } of declaredInverseEdges) {
    const isValidTargetField = isValidJunctionTargetField({
      fieldMetadataItem: targetField,
      sourceFieldMetadataId: relationTargetFieldMetadataId,
    });

    if (!isDefined(owner)) {
      hasBrokenDeclaredInverseEdge ||= isValidTargetField;
      continue;
    }

    const isConfiguredOnOwningSide = hasJunctionTargetFieldId(
      owner.fieldMetadataItem.settings,
    );
    const isConfiguredForRequestedReverse =
      isConfiguredOnOwningSide &&
      matchesFieldId(
        reverseSourceField,
        owner.fieldMetadataItem.settings.junctionTargetFieldId,
      );
    const markInvalidConfiguredCandidate = () => {
      hasInvalidConfiguredCandidate ||= isConfiguredOnOwningSide;
      hasInvalidConfiguredCandidateForRequestedReverse ||=
        isConfiguredForRequestedReverse;
    };

    const junctionConfig = getJunctionConfig({
      settings: owner.fieldMetadataItem.settings,
      relationObjectMetadataId: junctionObjectMetadataId,
      relationTargetFieldMetadataId: relation.sourceFieldMetadata.id,
      sourceObjectMetadataId: owner.objectMetadataItem.id,
      objectMetadataItems,
    });

    if (
      !isUsableJunctionConfig(junctionConfig) ||
      !isDefined(junctionConfig.sourceField)
    ) {
      markInvalidConfiguredCandidate();
      continue;
    }

    if (
      !junctionConfig.targetFields.some(
        (field) => field.id === reverseSourceField.id,
      )
    ) {
      continue;
    }

    if (
      !isValidTargetField ||
      junctionConfig.sourceField.id !== targetField.id
    ) {
      markInvalidConfiguredCandidate();
      continue;
    }

    const reverseJunctionConfig: ReverseJunctionConfig = {
      junctionObjectMetadata,
      sourceField: reverseSourceField,
      targetFields: [targetField],
      isMorphRelation: targetField.type === FieldMetadataType.MORPH_RELATION,
      isValid: true,
      isConfiguredOnOwningSide,
    };

    (isConfiguredOnOwningSide ? configuredCandidates : inferredCandidates).set(
      targetField.id,
      reverseJunctionConfig,
    );
  }

  if (hasInvalidConfiguredCandidateForRequestedReverse) {
    return { status: 'invalid' };
  }

  if (configuredCandidates.size > 1) {
    return { status: 'ambiguous' };
  }

  const configuredCandidate = configuredCandidates.values().next().value;

  if (isDefined(configuredCandidate)) {
    return { status: 'resolved', junctionConfig: configuredCandidate };
  }

  if (inferredCandidates.size > 1) {
    return { status: 'ambiguous' };
  }

  const inferredCandidate = inferredCandidates.values().next().value;

  if (isDefined(inferredCandidate)) {
    return { status: 'resolved', junctionConfig: inferredCandidate };
  }

  return hasInvalidConfiguredCandidate || hasBrokenDeclaredInverseEdge
    ? { status: 'invalid' }
    : { status: 'not-found' };
};
