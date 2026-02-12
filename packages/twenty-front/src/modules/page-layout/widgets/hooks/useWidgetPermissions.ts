import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { checkFieldPermissions } from '@/page-layout/utils/checkFieldPermissions';
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

  const fieldMetadataIds = extractFieldMetadataIdsFromWidget(widget);
  const allFieldsAccessible = checkFieldPermissions(
    fieldMetadataIds,
    objectPermissions,
  );

  if (!allFieldsAccessible) {
    const restrictedFieldNames = fieldMetadataIds
      .filter((fieldId) => {
        const fieldPermission = objectPermissions.restrictedFields[fieldId];
        return isDefined(fieldPermission) && fieldPermission.canRead === false;
      })
      .map((fieldId) => {
        const field = objectMetadata?.fields?.find((f) => f.id === fieldId);
        return field?.label || field?.name || 'Unknown';
      })
      .filter(isDefined);

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
