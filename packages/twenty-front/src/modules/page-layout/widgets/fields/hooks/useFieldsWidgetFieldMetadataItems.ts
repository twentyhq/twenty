import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';

type UseFieldsWidgetFieldMetadataItemsProps = {
  objectNameSingular: string;
};

export const useFieldsWidgetFieldMetadataItems = ({
  objectNameSingular,
}: UseFieldsWidgetFieldMetadataItemsProps) => {
  const { inlineFieldMetadataItems, legacyActivityTargetFieldMetadataItems } =
    useFieldListFieldMetadataItems({
      objectNameSingular,
      excludeFieldMetadataIds: [],
      excludeCreatedAtAndUpdatedAt: true,
      showRelationSections: true,
    });

  return {
    inlineFieldMetadataItems,
    legacyActivityTargetFieldMetadataItems,
  };
};
