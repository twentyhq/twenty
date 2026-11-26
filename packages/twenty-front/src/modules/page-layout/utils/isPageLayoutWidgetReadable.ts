import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { WIDGET_TYPE_TO_READ_OBJECT_NAME_SINGULAR } from '@/page-layout/constants/WidgetTypeToReadObjectNameSingular';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type IsPageLayoutWidgetReadableArguments = {
  widget: Pick<PageLayoutWidget, 'type' | 'objectMetadataId'> & {
    configuration?: PageLayoutWidget['configuration'] | null;
  };
  objectMetadataItems: (Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular'
  > & {
    fields: Pick<FieldMetadataItem, 'id' | 'relation'>[];
  })[];
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

  const relationFieldMetadataIds =
    widget.configuration?.__typename === 'FieldConfiguration'
      ? [
          widget.configuration.fieldMetadataId,
          widget.configuration.nestedRelationFieldMetadataId,
        ].filter(isDefined)
      : [];

  const relationTargetObjectMetadataIds = objectMetadataItems
    .flatMap((objectMetadataItem) => objectMetadataItem.fields)
    .filter((field) => relationFieldMetadataIds.includes(field.id))
    .map((field) => field.relation?.targetObjectMetadata.id);

  return [
    widget.objectMetadataId,
    readObjectMetadataId,
    ...relationTargetObjectMetadataIds,
  ]
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
