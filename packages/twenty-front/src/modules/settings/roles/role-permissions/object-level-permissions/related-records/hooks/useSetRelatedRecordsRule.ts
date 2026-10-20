import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { MetadataReadability } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const useSetRelatedRecordsRule = () => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const setRelatedRecordsRule = async ({
    rule: { childObjectMetadataItem, parentFieldMetadataItem },
    isEnabled,
  }: {
    rule: SettingsRoleRelatedRecordsRule;
    isEnabled: boolean;
  }) => {
    const currentParentFieldUniversalIdentifiers =
      childObjectMetadataItem.readability === MetadataReadability.INHERITED
        ? (childObjectMetadataItem.readabilityParentFieldUniversalIdentifiers ??
          [])
        : [];

    const otherParentFieldUniversalIdentifiers =
      currentParentFieldUniversalIdentifiers.filter(
        (universalIdentifier) =>
          universalIdentifier !== parentFieldMetadataItem.universalIdentifier,
      );

    const readabilityParentFieldUniversalIdentifiers = isEnabled
      ? [
          ...otherParentFieldUniversalIdentifiers,
          parentFieldMetadataItem.universalIdentifier,
        ]
      : otherParentFieldUniversalIdentifiers;

    await updateOneObjectMetadataItem({
      idToUpdate: childObjectMetadataItem.id,
      updatePayload: isNonEmptyArray(readabilityParentFieldUniversalIdentifiers)
        ? {
            readability: MetadataReadability.INHERITED,
            readabilityParentFieldUniversalIdentifiers,
          }
        : {
            readability: MetadataReadability.OPEN,
            readabilityParentFieldUniversalIdentifiers: null,
          },
      shouldRefetchCommandMenuItems: false,
    });
  };

  return { setRelatedRecordsRule };
};
