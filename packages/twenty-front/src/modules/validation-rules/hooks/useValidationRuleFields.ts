import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ValidationRuleScope } from '@/validation-rules/types/ValidationRuleScope';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

export const useValidationRuleFields = ({
  objectMetadataItem,
  scope = 'record',
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  scope?: ValidationRuleScope;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  return {
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataItem,
      objectMetadataItems,
      scope,
    }),
    editorFields: buildValidationRuleEditorFields({
      objectMetadataItem,
      objectMetadataItems,
      scope,
    }),
  };
};
