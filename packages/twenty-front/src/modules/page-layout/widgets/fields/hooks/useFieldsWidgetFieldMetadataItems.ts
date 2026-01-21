import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';

type UseFieldsWidgetFieldMetadataItemsProps = {
  objectNameSingular: string;
};

export const useFieldsWidgetFieldMetadataItems = ({
  objectNameSingular,
}: UseFieldsWidgetFieldMetadataItemsProps): FieldMetadataItem[] => {
  const { inlineFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular,
    excludeFieldMetadataIds: [],
    excludeCreatedAtAndUpdatedAt: true,
    showRelationSections: false,
  });

  return inlineFieldMetadataItems ?? [];
};
