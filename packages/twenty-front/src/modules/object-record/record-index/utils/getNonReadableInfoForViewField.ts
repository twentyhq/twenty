import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getNonReadableFieldInfoForViewField = ({
  fieldMetadataId,
  objectMetadataItem,
  objectMetadataItems,
  readableFieldIds,
  objectPermissionsByObjectMetadataId,
}: {
  fieldMetadataId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  readableFieldIds: Set<string>;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}): { fieldLabel?: string; objectLabel: string } | undefined => {
  const { fieldMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });

  if (!isDefined(fieldMetadataItem)) {
    return;
  }

  if (!readableFieldIds.has(fieldMetadataId)) {
    return {
      fieldLabel: fieldMetadataItem.label,
      objectLabel: objectMetadataItem.labelSingular,
    };
  }

  if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
    return;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular ===
      fieldMetadataItem.relation?.targetObjectMetadata.nameSingular,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return;
  }

  const targetObjectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    targetObjectMetadataItem.id,
  );

  if (!targetObjectPermissions.canReadObjectRecords) {
    return {
      objectLabel: targetObjectMetadataItem.labelSingular,
    };
  }

  const labelIdentifierFieldId =
    targetObjectMetadataItem.labelIdentifierFieldMetadataId;

  const labelIdentifierField = targetObjectMetadataItem.fields.find(
    (field) => field.id === labelIdentifierFieldId,
  );

  const isLabelIdentifierReadable =
    targetObjectMetadataItem.readableFields.some(
      (field) => field.id === labelIdentifierFieldId,
    );

  if (!isLabelIdentifierReadable) {
    return {
      fieldLabel: labelIdentifierField?.label,
      objectLabel: targetObjectMetadataItem.labelSingular,
    };
  }
};
