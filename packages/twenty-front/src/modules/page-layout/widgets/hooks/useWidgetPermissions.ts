import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { extractFieldMetadataIdsFromWidget } from '@/page-layout/utils/extractFieldMetadataIdsFromWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { isDefined } from 'twenty-shared/utils';

export type UseWidgetPermissionsReturn = {
  hasAccess: boolean;
  restriction: WidgetAccessDenialInfo;
};

export const useWidgetPermissions = (
  widget: PageLayoutWidget,
): UseWidgetPermissionsReturn => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isDefined(widget.objectMetadataId)) {
    return {
      hasAccess: true,
      restriction: {
        type: null,
      },
    };
  }

  const objectMetadata = objectMetadataItems.find(
    (item) => item.id === widget.objectMetadataId,
  );

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    widget.objectMetadataId,
  );

  const hasObjectAccess = objectPermissions.canReadObjectRecords;

  if (!hasObjectAccess) {
    return {
      hasAccess: false,
      restriction: {
        type: 'object',
        objectName: objectMetadata?.labelSingular,
      },
    };
  }

  const nonReadableFieldMetadataIds = extractFieldMetadataIdsFromWidget(
    widget,
  ).filter(
    (fieldMetadataId) =>
      !getFieldPermissions({ objectPermissions, fieldMetadataId }).canReadField,
  );

  if (nonReadableFieldMetadataIds.length > 0) {
    const restrictedFieldNames = nonReadableFieldMetadataIds.map(
      (fieldMetadataId) => {
        const fieldMetadataItem = objectMetadata?.fields?.find(
          (field) => field.id === fieldMetadataId,
        );
        return fieldMetadataItem?.label || fieldMetadataItem?.name || 'Unknown';
      },
    );

    return {
      hasAccess: false,
      restriction: {
        type: 'field',
        objectName: objectMetadata?.labelSingular,
        fieldNames: restrictedFieldNames,
      },
    };
  }

  return {
    hasAccess: true,
    restriction: {
      type: null,
    },
  };
};
