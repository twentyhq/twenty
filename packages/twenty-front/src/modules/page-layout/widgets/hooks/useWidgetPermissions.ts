import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { checkFieldPermissions } from '@/page-layout/utils/checkFieldPermissions';
import { extractFieldMetadataIdsFromWidget } from '@/page-layout/utils/extractFieldMetadataIdsFromWidget';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';

export type UseWidgetPermissionsReturn = {
  hasAccess: boolean;
  restrictionType: 'object' | 'field' | null;
  restrictedObjectName?: string;
  restrictedFieldNames?: string[];
};

export const useWidgetPermissions = (
  widget: PageLayoutWidget,
): UseWidgetPermissionsReturn => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isDefined(widget.objectMetadataId)) {
    return {
      hasAccess: true,
      restrictionType: null,
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
      restrictionType: 'object',
      restrictedObjectName: objectMetadata?.labelSingular,
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
      restrictionType: 'field',
      restrictedObjectName: objectMetadata?.labelSingular,
      restrictedFieldNames,
    };
  }

  return {
    hasAccess: true,
    restrictionType: null,
  };
};
