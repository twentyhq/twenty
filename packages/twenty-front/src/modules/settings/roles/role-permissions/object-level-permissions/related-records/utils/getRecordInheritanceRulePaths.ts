import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { getJunctionObjectMetadataItem } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getJunctionObjectMetadataItem';
import { getManyToOneFieldIdsTargeting } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getManyToOneFieldIdsTargeting';
import { isDefined } from 'twenty-shared/utils';

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
      getManyToOneFieldIdsTargeting({
        fieldMetadataItem,
        targetObjectMetadataId: parentObjectMetadataId,
      }).map((fieldMetadataId): SettingsRoleRelatedRecordsRule => ({
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
          getManyToOneFieldIdsTargeting({
            fieldMetadataItem: junctionFieldMetadataItem,
            targetObjectMetadataId: parentObjectMetadataId,
          }).map((junctionFieldMetadataId): SettingsRoleRelatedRecordsRule => ({
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
