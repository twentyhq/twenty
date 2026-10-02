import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectReadOnly } from '@/object-record/read-only/utils/isObjectReadOnly';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsObjectReadOnly = (objectMetadataId: string) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const objectPermissions = useObjectPermissionsForObject(objectMetadataId);

  return isObjectReadOnly({
    isLayoutCustomizationModeEnabled,
    objectPermissions,
    objectMetadataItem,
  });
};
