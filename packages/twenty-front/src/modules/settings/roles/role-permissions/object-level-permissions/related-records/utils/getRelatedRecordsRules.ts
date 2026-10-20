import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordInheritanceRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/RecordInheritanceRule';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { getRecordInheritanceRulePaths } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRecordInheritanceRulePaths';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

const isManyToOneFieldTargeting = (
  fieldMetadataItem: FieldMetadataItem,
  targetObjectMetadataId: string,
) => {
  if (fieldMetadataItem.isActive === false) {
    return false;
  }

  if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
    return (
      fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
      fieldMetadataItem.relation.targetObjectMetadata.id ===
        targetObjectMetadataId
    );
  }

  return (
    fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
    (fieldMetadataItem.morphRelations ?? []).some(
      (morphRelation) =>
        morphRelation.type === RelationType.MANY_TO_ONE &&
        morphRelation.targetObjectMetadata.id === targetObjectMetadataId,
    )
  );
};

// A morph parent is declared on one of its per-target fields, which the
// client merges into a single field, so an unmatched declaration can only
// point at the object's morph field when it has exactly one
const isDeclaredParentField = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldMetadataItem: FieldMetadataItem,
) => {
  if (objectMetadataItem.readability !== MetadataReadability.INHERITED) {
    return false;
  }

  const declaredUniversalIdentifiers =
    objectMetadataItem.readabilityParentFieldUniversalIdentifiers ?? [];

  if (
    declaredUniversalIdentifiers.includes(fieldMetadataItem.universalIdentifier)
  ) {
    return true;
  }

  if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
    return false;
  }

  const morphFieldMetadataItems = objectMetadataItem.fields.filter(
    (field) => field.type === FieldMetadataType.MORPH_RELATION,
  );

  const hasUnmatchedDeclaration = declaredUniversalIdentifiers.some(
    (universalIdentifier) =>
      !objectMetadataItem.fields.some(
        (field) => field.universalIdentifier === universalIdentifier,
      ),
  );

  return morphFieldMetadataItems.length === 1 && hasUnmatchedDeclaration;
};

const getObjectsInheritingFrom = ({
  parentObjectMetadataId,
  objectMetadataItems,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) =>
  objectMetadataItems.flatMap((childObjectMetadataItem) =>
    childObjectMetadataItem.fields
      .filter(
        (fieldMetadataItem) =>
          isManyToOneFieldTargeting(
            fieldMetadataItem,
            parentObjectMetadataId,
          ) &&
          isDeclaredParentField(childObjectMetadataItem, fieldMetadataItem),
      )
      .map((parentFieldMetadataItem) => ({
        childObjectMetadataItem,
        parentFieldMetadataItem,
      })),
  );

const RULE_FOLLOWING_READABILITIES: MetadataReadability[] = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
  MetadataReadability.INHERITED,
];

const getPathKey = ({
  fieldMetadataId,
  junctionFieldMetadataId,
}: {
  fieldMetadataId: string;
  junctionFieldMetadataId?: string | null;
}) => `${fieldMetadataId}-${junctionFieldMetadataId ?? ''}`;

// Inheritance declared by the standard app or an installed app, which a workspace cannot remove
const getDeclaredRules = ({
  parentObjectMetadataId,
  objectMetadataItems,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): SettingsRoleRelatedRecordsRule[] => {
  const directInheritances = getObjectsInheritingFrom({
    parentObjectMetadataId,
    objectMetadataItems,
  });

  const belongsToOneRules = directInheritances
    .filter(({ childObjectMetadataItem }) => !childObjectMetadataItem.isSystem)
    .map(
      ({
        childObjectMetadataItem,
        parentFieldMetadataItem,
      }): SettingsRoleRelatedRecordsRule => ({
        key: `declared-${parentFieldMetadataItem.id}`,
        childObjectMetadataItem,
        fieldMetadataId: parentFieldMetadataItem.id,
        junctionFieldMetadataId: null,
        relationLabel: parentFieldMetadataItem.label,
        relationKind: 'BELONGS_TO_ONE',
      }),
    );

  // Notes and tasks inherit from their junction targets, which inherit from the parent
  const junctionObjectMetadataIds = new Set(
    directInheritances
      .filter(({ childObjectMetadataItem }) => childObjectMetadataItem.isSystem)
      .map(({ childObjectMetadataItem }) => childObjectMetadataItem.id),
  );

  const manyToManyRules = objectMetadataItems.flatMap(
    (childObjectMetadataItem) =>
      childObjectMetadataItem.isSystem
        ? []
        : childObjectMetadataItem.fields
            .filter(
              (fieldMetadataItem) =>
                fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
                junctionObjectMetadataIds.has(
                  fieldMetadataItem.relation.targetObjectMetadata.id,
                ) &&
                isDeclaredParentField(
                  childObjectMetadataItem,
                  fieldMetadataItem,
                ),
            )
            .map((fieldMetadataItem): SettingsRoleRelatedRecordsRule => ({
              key: `declared-${fieldMetadataItem.id}`,
              childObjectMetadataItem,
              fieldMetadataId: fieldMetadataItem.id,
              junctionFieldMetadataId: null,
              relationLabel: fieldMetadataItem.label,
              relationKind: 'MANY_TO_MANY',
            })),
  );

  return [...belongsToOneRules, ...manyToManyRules];
};

export const getRelatedRecordsRules = ({
  parentObjectMetadataId,
  objectMetadataItems,
  recordInheritanceRules,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordInheritanceRules: RecordInheritanceRule[];
}) => {
  const declaredRules = getDeclaredRules({
    parentObjectMetadataId,
    objectMetadataItems,
  });

  const candidateChildObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      !objectMetadataItem.isSystem &&
      objectMetadataItem.isActive &&
      objectMetadataItem.id !== parentObjectMetadataId &&
      RULE_FOLLOWING_READABILITIES.includes(objectMetadataItem.readability),
  );

  const pathsByKey = new Map(
    candidateChildObjectMetadataItems
      .flatMap((childObjectMetadataItem) =>
        getRecordInheritanceRulePaths({
          childObjectMetadataItem,
          parentObjectMetadataId,
          objectMetadataItems,
        }),
      )
      .map((path) => [getPathKey(path), path]),
  );

  const storedRules = recordInheritanceRules
    .filter((rule) => rule.parentObjectMetadataId === parentObjectMetadataId)
    .flatMap((rule): SettingsRoleRelatedRecordsRule[] => {
      const path = pathsByKey.get(getPathKey(rule));

      return isDefined(path)
        ? [{ ...path, key: rule.id, recordInheritanceRuleId: rule.id }]
        : [];
    });

  const usedPathKeys = new Set(recordInheritanceRules.map(getPathKey));
  // A declared parent field already covers every path that starts with it
  const declaredFieldMetadataIds = new Set(
    declaredRules.map(({ fieldMetadataId }) => fieldMetadataId),
  );

  return {
    rules: [...declaredRules, ...storedRules],
    availableRules: [...pathsByKey.values()].filter(
      (path) =>
        !usedPathKeys.has(getPathKey(path)) &&
        !declaredFieldMetadataIds.has(path.fieldMetadataId),
    ),
  };
};
