import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  isQueryTimeFormulaFieldMetadata,
  isValidationRulePreviousValuePath,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { RelationType } from '~/generated-metadata/graphql';

// One-to-many relations are read inside aggregates such as count(tasks)
const FORMULA_READABLE_RELATION_TYPES = [
  RelationType.MANY_TO_ONE,
  RelationType.ONE_TO_MANY,
];

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
        !isQueryTimeFormulaFieldMetadata(fieldMetadataItem),
    ),
  });

  const storedObjectMetadataItem = withStoredFieldsOnly(objectMetadataItem);
  const storedObjectMetadataItems =
    objectMetadataItems.map(withStoredFieldsOnly);

  return {
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataItem: storedObjectMetadataItem,
      objectMetadataItems: storedObjectMetadataItems,
      readableRelationTypes: FORMULA_READABLE_RELATION_TYPES,
    }),
    editorFields: buildValidationRuleEditorFields({
      objectMetadataItem: storedObjectMetadataItem,
      objectMetadataItems: storedObjectMetadataItems,
      readableRelationTypes: FORMULA_READABLE_RELATION_TYPES,
    }).filter(({ path }) => !isValidationRulePreviousValuePath(path)),
  };
};
