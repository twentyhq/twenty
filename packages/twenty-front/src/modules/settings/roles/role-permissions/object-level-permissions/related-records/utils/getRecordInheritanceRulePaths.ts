import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Morph targets are merged into one client field, but each target has its own server field
const getManyToOneFieldIdsTargeting = (
  fieldMetadataItem: FieldMetadataItem,
  targetObjectMetadataId: string,
): string[] => {
  if (fieldMetadataItem.isActive === false) {
    return [];
  }

  if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
    return fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
      fieldMetadataItem.relation.targetObjectMetadata.id ===
        targetObjectMetadataId
      ? [fieldMetadataItem.id]
      : [];
  }

  if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
    return [];
  }

  return (fieldMetadataItem.morphRelations ?? [])
    .filter(
      (morphRelation) =>
        morphRelation.type === RelationType.MANY_TO_ONE &&
        morphRelation.targetObjectMetadata.id === targetObjectMetadataId,
    )
    .map((morphRelation) => morphRelation.sourceFieldMetadata.id);
};

// A junction is a custom many-to-many field, or a system object holding a
// plain relation back to the record, like note targets
const getJunctionObjectMetadataItem = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem | undefined => {
  if (
    fieldMetadataItem.isActive === false ||
    fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    fieldMetadataItem.relation?.type !== RelationType.ONE_TO_MANY
  ) {
    return undefined;
  }

  const { targetObjectMetadata, targetFieldMetadata } =
    fieldMetadataItem.relation;

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectMetadata.id,
  );

  if (!isDefined(junctionObjectMetadataItem)) {
    return undefined;
  }

  const backReferenceFieldMetadataItem = junctionObjectMetadataItem.fields.find(
    (field) => field.id === targetFieldMetadata.id,
  );

  const isSystemJunction =
    junctionObjectMetadataItem.isSystem &&
    backReferenceFieldMetadataItem?.type === FieldMetadataType.RELATION;

  return isSystemJunction ||
    isConfiguredJunctionRelationField(fieldMetadataItem)
    ? junctionObjectMetadataItem
    : undefined;
};

export const getRecordInheritanceRulePaths = ({
  childObjectMetadataItem,
  parentObjectMetadataId,
  objectMetadataItems,
}: {
  childObjectMetadataItem: EnrichedObjectMetadataItem;
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): SettingsRoleRelatedRecordsRule[] => {
  const oneHopPaths = childObjectMetadataItem.fields.flatMap(
    (fieldMetadataItem) =>
      getManyToOneFieldIdsTargeting(
        fieldMetadataItem,
        parentObjectMetadataId,
      ).map((fieldMetadataId): SettingsRoleRelatedRecordsRule => ({
        key: fieldMetadataId,
        childObjectMetadataItem,
        fieldMetadataId,
        junctionFieldMetadataId: null,
        relationLabel: fieldMetadataItem.label,
        relationKind: 'BELONGS_TO_ONE',
      })),
  );

  const twoHopPaths = childObjectMetadataItem.fields.flatMap(
    (fieldMetadataItem) => {
      const junctionObjectMetadataItem = getJunctionObjectMetadataItem({
        fieldMetadataItem,
        objectMetadataItems,
      });

      if (
        !isDefined(junctionObjectMetadataItem) ||
        junctionObjectMetadataItem.id === parentObjectMetadataId
      ) {
        return [];
      }

      return junctionObjectMetadataItem.fields.flatMap(
        (junctionFieldMetadataItem) =>
          getManyToOneFieldIdsTargeting(
            junctionFieldMetadataItem,
            parentObjectMetadataId,
          ).map((junctionFieldMetadataId): SettingsRoleRelatedRecordsRule => ({
            key: `${fieldMetadataItem.id}-${junctionFieldMetadataId}`,
            childObjectMetadataItem,
            fieldMetadataId: fieldMetadataItem.id,
            junctionFieldMetadataId,
            relationLabel: `${fieldMetadataItem.label} · ${junctionFieldMetadataItem.label}`,
            relationKind: 'MANY_TO_MANY',
          })),
      );
    },
  );

  return [...oneHopPaths, ...twoHopPaths];
};
