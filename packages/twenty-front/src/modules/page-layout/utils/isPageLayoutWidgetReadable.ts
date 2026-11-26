import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { WIDGET_TYPE_TO_READ_OBJECT_NAME_SINGULAR } from '@/page-layout/constants/WidgetTypeToReadObjectNameSingular';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type IsPageLayoutWidgetReadableArguments = {
  widget: Pick<PageLayoutWidget, 'type' | 'objectMetadataId'>;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular'
  >[];
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

export const isPageLayoutWidgetReadable = ({
  widget,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: IsPageLayoutWidgetReadableArguments): boolean => {
  const readObjectNameSingular =
    WIDGET_TYPE_TO_READ_OBJECT_NAME_SINGULAR[widget.type];

  const readObjectMetadataId = isDefined(readObjectNameSingular)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === readObjectNameSingular,
      )?.id
    : undefined;

  return [widget.objectMetadataId, readObjectMetadataId]
    .filter(isDefined)
    .every((objectMetadataId) =>
      canAccessThroughAllRecordsOrRlsPermission({
        objectRecordsPermissions: getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataId,
        ),
        operationType: 'read',
      }),
    );
};
