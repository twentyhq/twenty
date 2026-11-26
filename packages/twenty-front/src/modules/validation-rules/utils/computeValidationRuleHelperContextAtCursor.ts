import { type Editor } from '@tiptap/core';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperContext } from '@/validation-rules/types/ValidationRuleHelperContext';
import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';
import { computeValidationRuleHelperContext } from '@/validation-rules/utils/computeValidationRuleHelperContext';
import { getValidationRuleEditorText } from '@/validation-rules/utils/getValidationRuleEditorText';

export const computeValidationRuleHelperContextAtCursor = ({
  editor,
  fields,
  functionDefinitions,
  keywordDefinitions,
}: {
  editor: Editor;
  fields: ValidationRuleEditorField[];
  functionDefinitions?: ValidationRuleSyntaxDefinition[];
  keywordDefinitions?: ValidationRuleSyntaxDefinition[];
}): ValidationRuleHelperContext => {
  const { doc, selection } = editor.state;
  const nodeBeforeCursor = selection.$from.nodeBefore;

  return computeValidationRuleHelperContext({
    textBeforeCursor: getValidationRuleEditorText(doc, selection.from),
    fieldPathBeforeCursor:
      nodeBeforeCursor?.type.name === VALIDATION_RULE_FIELD_NODE_NAME
        ? String(nodeBeforeCursor.attrs.path)
        : undefined,
    fields,
    functionDefinitions,
    keywordDefinitions,
  });
};
