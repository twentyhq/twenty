import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { isDefined } from 'twenty-shared/utils';

type UseWidgetObjectPermissionsReturn = {
  haveAccessToWidgetsObject: boolean;
};

export const useWidgetObjectPermissions = (
  widget: Widget,
): UseWidgetObjectPermissionsReturn => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  if (!isDefined(widget.objectMetadataId)) {
    return {
      haveAccessToWidgetsObject: true,
    };
  }

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    widget.objectMetadataId,
  );

  return {
    haveAccessToWidgetsObject: objectPermissions.canReadObjectRecords,
  };
};
