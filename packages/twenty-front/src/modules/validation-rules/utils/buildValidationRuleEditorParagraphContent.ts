import { type JSONContent } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';
import { type ValidationRuleEditorSegment } from '@/validation-rules/types/ValidationRuleEditorSegment';
import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';

export const buildValidationRuleEditorParagraphContent = ({
  segments,
  getFieldNodeAttributes,
}: {
  segments: ValidationRuleEditorSegment[];
  getFieldNodeAttributes: (
    path: string,
  ) => ValidationRuleFieldNodeAttributes | null;
}): JSONContent[] =>
  segments.flatMap((segment): JSONContent[] => {
    if (segment.type === 'text') {
      return segment.text.length > 0
        ? [{ type: 'text', text: segment.text }]
        : [];
    }

    const attributes = getFieldNodeAttributes(segment.path);

    return isDefined(attributes)
      ? [{ type: VALIDATION_RULE_FIELD_NODE_NAME, attrs: attributes }]
      : [{ type: 'text', text: segment.path }];
  });
