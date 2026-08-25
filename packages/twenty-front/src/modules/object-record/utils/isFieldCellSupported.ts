import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type IsFieldCellSupportedOptions = {
  includeSystemObjectRelations?: boolean;
};

export const isFieldCellSupported = (
  fieldMetadataItem: FieldMetadataItem,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  options: IsFieldCellSupportedOptions = {},
) => {
  if (fieldMetadataItem.type === FieldMetadataType.POSITION) {
    return false;
  }

  if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
    const relationObjectMetadataItemId =
      fieldMetadataItem.relation?.targetObjectMetadata.id;

    const relationObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === relationObjectMetadataItemId,
    );

    // A junction object is a system object on purpose, so the relation holding its records
    // is still cell-supported even though relations to system objects are not.
    if (isJunctionRelationField(fieldMetadataItem)) {
      return true;
    }

    if (!fieldMetadataItem.relation || !relationObjectMetadataItem) {
      return false;
    }

    if (
      !options.includeSystemObjectRelations &&
      !isObjectMetadataAvailableForRelation(relationObjectMetadataItem)
    ) {
      return false;
    }
  }

  return (
    !isHiddenSystemField(fieldMetadataItem) && !!fieldMetadataItem.isActive
  );
};
