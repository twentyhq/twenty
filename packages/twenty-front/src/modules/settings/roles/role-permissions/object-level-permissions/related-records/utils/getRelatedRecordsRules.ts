import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
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

export const getRelatedRecordsRules = ({
  parentObjectMetadataId,
  objectMetadataItems,
  isEditableObjectMetadataItem,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isEditableObjectMetadataItem: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => boolean;
}) => {
  const directInheritances = getObjectsInheritingFrom({
    parentObjectMetadataId,
    objectMetadataItems,
  });

  const belongsToOneRules: SettingsRoleRelatedRecordsRule[] = directInheritances
    .filter(({ childObjectMetadataItem }) => !childObjectMetadataItem.isSystem)
    .map((inheritance) => ({ ...inheritance, relationKind: 'BELONGS_TO_ONE' }));

  // Notes and tasks inherit from their junction targets, which inherit from the parent
  const junctionObjectMetadataIds = new Set(
    directInheritances
      .filter(({ childObjectMetadataItem }) => childObjectMetadataItem.isSystem)
      .map(({ childObjectMetadataItem }) => childObjectMetadataItem.id),
  );

  const manyToManyRules: SettingsRoleRelatedRecordsRule[] =
    objectMetadataItems.flatMap((childObjectMetadataItem) =>
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
            .map((parentFieldMetadataItem) => ({
              childObjectMetadataItem,
              parentFieldMetadataItem,
              relationKind: 'MANY_TO_MANY' as const,
            })),
    );

  const ruleFieldIds = new Set(
    belongsToOneRules.map(
      ({ parentFieldMetadataItem }) => parentFieldMetadataItem.id,
    ),
  );

  // Objects owned by the standard app or an installed app keep their own readability
  const availableRules: SettingsRoleRelatedRecordsRule[] = objectMetadataItems
    .filter(
      (childObjectMetadataItem) =>
        !childObjectMetadataItem.isSystem &&
        isEditableObjectMetadataItem(childObjectMetadataItem),
    )
    .flatMap((childObjectMetadataItem) =>
      childObjectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.type === FieldMetadataType.RELATION &&
            isManyToOneFieldTargeting(
              fieldMetadataItem,
              parentObjectMetadataId,
            ) &&
            !ruleFieldIds.has(fieldMetadataItem.id),
        )
        .map((parentFieldMetadataItem) => ({
          childObjectMetadataItem,
          parentFieldMetadataItem,
          relationKind: 'BELONGS_TO_ONE' as const,
        })),
    );

  return {
    rules: [...belongsToOneRules, ...manyToManyRules],
    availableRules,
  };
};
