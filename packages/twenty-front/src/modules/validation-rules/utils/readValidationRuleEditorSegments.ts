import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';
import { type ValidationRuleEditorSegment } from '@/validation-rules/types/ValidationRuleEditorSegment';
import { getValidationRuleEditorNodeTextLength } from '@/validation-rules/utils/getValidationRuleEditorNodeTextLength';

export const readValidationRuleEditorSegments = (
  document: ProseMirrorNode,
): {
  segments: ValidationRuleEditorSegment[];
  fieldRanges: { start: number; end: number }[];
} => {
  const segments: ValidationRuleEditorSegment[] = [];
  const fieldRanges: { start: number; end: number }[] = [];

  let consumedTextLength = 0;

  for (const node of document.firstChild?.children ?? []) {
    const nodeTextLength = getValidationRuleEditorNodeTextLength(node);

    if (node.type.name === VALIDATION_RULE_FIELD_NODE_NAME) {
      segments.push({ type: 'field', path: String(node.attrs.path) });
      fieldRanges.push({
        start: consumedTextLength,
        end: consumedTextLength + nodeTextLength,
      });
    } else if (node.isText) {
      segments.push({ type: 'text', text: node.text ?? '' });
    }

    consumedTextLength += nodeTextLength;
  }

  return { segments, fieldRanges };
};
