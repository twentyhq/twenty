import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// A junction is a configured many-to-many or a system object like note targets
export const getJunctionObjectMetadataItem = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem | undefined => {
  if (
    fieldMetadataItem.isActive === false ||
    fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    fieldMetadataItem.relation?.type !== RelationType.ONE_TO_MANY
  ) {
    return undefined;
  }

  const { targetObjectMetadata, targetFieldMetadata } =
    fieldMetadataItem.relation;

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectMetadata.id,
  );

  if (!isDefined(junctionObjectMetadataItem)) {
    return undefined;
  }

  if (isConfiguredJunctionRelationField(fieldMetadataItem)) {
    return junctionObjectMetadataItem;
  }

  const backReferenceFieldMetadataItem = junctionObjectMetadataItem.fields.find(
    (field) => field.id === targetFieldMetadata.id,
  );

  return junctionObjectMetadataItem.isSystem &&
    backReferenceFieldMetadataItem?.type === FieldMetadataType.RELATION
    ? junctionObjectMetadataItem
    : undefined;
};
