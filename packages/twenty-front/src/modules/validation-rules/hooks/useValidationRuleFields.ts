import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

export const useValidationRuleFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  return {
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataItem,
      objectMetadataItems,
    }),
    editorFields: buildValidationRuleEditorFields({
      objectMetadataItem,
      objectMetadataItems,
    }),
  };
};
