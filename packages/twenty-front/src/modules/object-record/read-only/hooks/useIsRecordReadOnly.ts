import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseIsRecordReadOnlyParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: UseIsRecordReadOnlyParams) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  const isRecordDeleted = useIsRecordDeleted({ recordId });

  return (
    isLayoutCustomizationModeEnabled ||
    isRecordReadOnly({
      objectPermissions,
      isRecordDeleted,
      objectMetadataItem,
    })
  );
};
