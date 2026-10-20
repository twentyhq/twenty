import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { getManyToOneFieldIdsTargeting } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getManyToOneFieldIdsTargeting';
import { isDeclaredParentField } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/isDeclaredParentField';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Inheritance declared by an app, which a workspace cannot remove
export const getDeclaredRelatedRecordsRules = ({
  parentObjectMetadataId,
  objectMetadataItems,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): SettingsRoleRelatedRecordsRule[] => {
  const directInheritances = objectMetadataItems.flatMap(
    (childObjectMetadataItem) =>
      childObjectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            isNonEmptyArray(
              getManyToOneFieldIdsTargeting({
                fieldMetadataItem,
                targetObjectMetadataId: parentObjectMetadataId,
              }),
            ) &&
            isDeclaredParentField({
              objectMetadataItem: childObjectMetadataItem,
              fieldMetadataItem,
            }),
        )
        .map((parentFieldMetadataItem) => ({
          childObjectMetadataItem,
          parentFieldMetadataItem,
        })),
  );

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

  // Notes and tasks inherit from their targets, which inherit from the parent
  const junctionObjectMetadataIds = new Set(
    directInheritances
      .filter(({ childObjectMetadataItem }) => childObjectMetadataItem.isSystem)
      .map(({ childObjectMetadataItem }) => childObjectMetadataItem.id),
  );

  const manyToManyRules = objectMetadataItems
    .filter((childObjectMetadataItem) => !childObjectMetadataItem.isSystem)
    .flatMap((childObjectMetadataItem) =>
      childObjectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
            junctionObjectMetadataIds.has(
              fieldMetadataItem.relation.targetObjectMetadata.id,
            ) &&
            isDeclaredParentField({
              objectMetadataItem: childObjectMetadataItem,
              fieldMetadataItem,
            }),
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
