import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';

type UseWidgetObjectPermissionsReturn = {
  haveAccessToWidgetsObject: boolean;
};

export const useWidgetObjectPermissions = (
  widget: PageLayoutWidget,
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
