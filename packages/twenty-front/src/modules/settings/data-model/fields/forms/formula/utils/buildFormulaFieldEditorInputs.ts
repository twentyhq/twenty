import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  isValidationRulePreviousValuePath,
  isFormulaFieldMetadata,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

type FormulaFieldEditorObject = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields' | 'labelSingular' | 'icon'
>;

export const buildFormulaFieldEditorInputs = ({
  objectMetadataItem,
  objectMetadataItems,
  fieldMetadataId,
}: {
  objectMetadataItem: FormulaFieldEditorObject;
  objectMetadataItems: FormulaFieldEditorObject[];
  fieldMetadataId?: string;
}): {
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
} => {
  const withStoredFieldsOnly = <TObject extends FormulaFieldEditorObject>(
    object: TObject,
  ): TObject => ({
    ...object,
    fields: object.fields.filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.id !== fieldMetadataId &&
        !isFormulaFieldMetadata(fieldMetadataItem),
    ),
  });

  const storedObjectMetadataItem = withStoredFieldsOnly(objectMetadataItem);
  const storedObjectMetadataItems =
    objectMetadataItems.map(withStoredFieldsOnly);

  return {
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataItem: storedObjectMetadataItem,
      objectMetadataItems: storedObjectMetadataItems,
    }),
    editorFields: buildValidationRuleEditorFields({
      objectMetadataItem: storedObjectMetadataItem,
      objectMetadataItems: storedObjectMetadataItems,
    }).filter(({ path }) => !isValidationRulePreviousValuePath(path)),
  };
};
