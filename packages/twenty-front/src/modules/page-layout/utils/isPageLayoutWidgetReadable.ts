import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { WIDGET_TYPE_TO_READ_OBJECT_NAME_SINGULAR } from '@/page-layout/constants/WidgetTypeToReadObjectNameSingular';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { resolveFieldWidgetNestedRelation } from '@/page-layout/widgets/field/utils/resolveFieldWidgetNestedRelation';
import { type View } from '@/views/types/View';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

type IsPageLayoutWidgetReadableArguments = {
  widget: Pick<PageLayoutWidget, 'type' | 'objectMetadataId'> & {
    configuration?: PageLayoutWidget['configuration'] | null;
  };
  pageObjectMetadataId: string | null | undefined;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  viewsByIdMap: Map<string, Pick<View, 'objectMetadataId'>>;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

const getFieldWidgetReadObjectMetadataIds = ({
  widget,
  pageObjectMetadataId,
  objectMetadataItems,
  viewsByIdMap,
}: Omit<
  IsPageLayoutWidgetReadableArguments,
  'objectPermissionsByObjectMetadataId'
>): (string | undefined)[] => {
  if (widget.configuration?.__typename !== 'FieldConfiguration') {
    return [];
  }

  const {
    fieldMetadataId,
    nestedRelationFieldMetadataId,
    viewId,
    fieldDisplayMode,
  } = widget.configuration;

  const sourceFieldMetadataItem = objectMetadataItems
    .find(
      (objectMetadataItem) => objectMetadataItem.id === pageObjectMetadataId,
    )
    ?.fields.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.name === fieldMetadataId ||
        doesFieldMetadataItemMatchFieldMetadataId({
          fieldMetadataItem,
          fieldMetadataId,
        }),
    );

  const relationTargetObjectMetadataId =
    sourceFieldMetadataItem?.relation?.targetObjectMetadata.id;

  if (!isDefined(relationTargetObjectMetadataId)) {
    return [];
  }

  const { targetObjectMetadataId } = getFieldWidgetRelationTraversal({
    sourceFieldMetadataItem,
    nestedRelationFieldMetadataItem: resolveFieldWidgetNestedRelation({
      objectMetadataItems,
      relationTargetObjectMetadataId,
      nestedRelationFieldMetadataId,
    })?.nestedRelationFieldMetadataItem,
    objectMetadataItems,
  });

  const isTableViewOnRelationTargetObject =
    fieldDisplayMode === FieldDisplayMode.TABLE &&
    isDefined(viewId) &&
    viewsByIdMap.get(viewId)?.objectMetadataId ===
      relationTargetObjectMetadataId;

  return [
    relationTargetObjectMetadataId,
    isTableViewOnRelationTargetObject ? undefined : targetObjectMetadataId,
  ];
};

// TODO: temporary, remove once conditional availability supports object read access
export const isPageLayoutWidgetReadable = ({
  widget,
  pageObjectMetadataId,
  objectMetadataItems,
  viewsByIdMap,
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

  return [
    widget.objectMetadataId,
    readObjectMetadataId,
    ...getFieldWidgetReadObjectMetadataIds({
      widget,
      pageObjectMetadataId,
      objectMetadataItems,
      viewsByIdMap,
    }),
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
