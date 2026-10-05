import { getSchema } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ValidationRuleFieldNode } from '@/validation-rules/extensions/ValidationRuleFieldNode';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleEditorParagraphContent } from '@/validation-rules/utils/buildValidationRuleEditorParagraphContent';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeValidationRuleEditorSegments } from '@/validation-rules/utils/computeValidationRuleEditorSegments';
import { getValidationRuleEditorText } from '@/validation-rules/utils/getValidationRuleEditorText';
import { getValidationRuleFormValues } from '@/validation-rules/utils/getValidationRuleFormValues';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock(
  '@/validation-rules/components/SettingsValidationRuleFieldNodeView',
  () => ({ SettingsValidationRuleFieldNodeView: () => null }),
);

const EDITOR_SCHEMA = getSchema([
  Document.extend({ content: 'paragraph' }),
  Paragraph,
  Text,
  ValidationRuleFieldNode,
]);

const renameField = ({
  objectMetadataItems,
  objectNameSingular,
  fieldName,
  newFieldName,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectNameSingular: string;
  fieldName: string;
  newFieldName: string;
}): EnrichedObjectMetadataItem[] =>
  objectMetadataItems.map((objectMetadataItem) =>
    objectMetadataItem.nameSingular === objectNameSingular
      ? {
          ...objectMetadataItem,
          fields: objectMetadataItem.fields.map((field) =>
            field.name === fieldName ? { ...field, name: newFieldName } : field,
          ),
        }
      : objectMetadataItem,
  );

const findOpportunity = (objectMetadataItems: EnrichedObjectMetadataItem[]) => {
  const opportunity = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === 'opportunity',
  );

  if (!isDefined(opportunity)) {
    throw new Error('The opportunity mock is missing');
  }

  return opportunity;
};

const computeEditorText = ({
  expression,
  objectMetadataItems,
}: {
  expression: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const editorFieldPaths = buildValidationRuleEditorFields({
    objectMetadataItem: findOpportunity(objectMetadataItems),
    objectMetadataItems,
  }).map(({ path }) => path);

  const segments = computeValidationRuleEditorSegments({
    expression,
    isFieldPath: (path) => editorFieldPaths.includes(path),
    cursorOffset: null,
    fieldRanges: [],
  });

  const document = EDITOR_SCHEMA.nodeFromJSON({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: buildValidationRuleEditorParagraphContent({
          segments,
          getFieldNodeAttributes: (path) => ({
            path,
            label: path,
            iconName: '',
          }),
        }),
      },
    ],
  });

  return {
    fieldPaths: segments.flatMap((segment) =>
      segment.type === 'field' ? [segment.path] : [],
    ),
    text: getValidationRuleEditorText(document),
  };
};

describe('getValidationRuleFormValues', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  const buildFields = (
    currentObjectMetadataItems: EnrichedObjectMetadataItem[],
  ) =>
    buildValidationRuleFieldDescriptors({
      objectMetadataItem: findOpportunity(currentObjectMetadataItems),
      objectMetadataItems: currentObjectMetadataItems,
    });

  const compilation = compileValidationRuleExpression({
    expression: 'stage != "CUSTOMER" or company.employees > 10',
    fields: buildFields(objectMetadataItems),
  });

  if (!compilation.isValid) {
    throw new Error(compilation.errorMessage);
  }

  const storedValidationRule: ValidationRule = {
    id: 'validation-rule-id',
    objectMetadataId: findOpportunity(objectMetadataItems).id,
    name: 'Big customers only',
    description: null,
    icon: null,
    errorFieldMetadataId: null,
    expression: compilation.expression,
    bindings: compilation.bindings,
    message: 'Customers need more than ten employees',
    isActive: true,
  };

  it('should round-trip a stored rule through the editor to the same stored rule', () => {
    const values = getValidationRuleFormValues({
      validationRule: storedValidationRule,
      fields: buildFields(objectMetadataItems),
    });

    expect(values.expression).toBe(
      'stage != "CUSTOMER" or company.employees > 10',
    );

    const editorText = computeEditorText({
      expression: values.expression,
      objectMetadataItems,
    });

    expect(editorText.fieldPaths).toEqual(['stage', 'company.employees']);
    expect(
      compileValidationRuleExpression({
        expression: editorText.text,
        bindings: values.bindings,
        fields: buildFields(objectMetadataItems),
      }),
    ).toEqual(compilation);
  });

  it('should show root and related fields with their new names after a rename and write back the same stored rule', () => {
    const renamedObjectMetadataItems = renameField({
      objectMetadataItems: renameField({
        objectMetadataItems,
        objectNameSingular: 'opportunity',
        fieldName: 'stage',
        newFieldName: 'pipelineStage',
      }),
      objectNameSingular: 'company',
      fieldName: 'employees',
      newFieldName: 'headcount',
    });

    const values = getValidationRuleFormValues({
      validationRule: storedValidationRule,
      fields: buildFields(renamedObjectMetadataItems),
    });

    expect(values.expression).toBe(
      'pipelineStage != "CUSTOMER" or company.headcount > 10',
    );

    const editorText = computeEditorText({
      expression: values.expression,
      objectMetadataItems: renamedObjectMetadataItems,
    });

    expect(editorText.fieldPaths).toEqual([
      'pipelineStage',
      'company.headcount',
    ]);
    expect(
      compileValidationRuleExpression({
        expression: editorText.text,
        bindings: values.bindings,
        fields: buildFields(renamedObjectMetadataItems),
      }),
    ).toEqual(compilation);
  });
});
