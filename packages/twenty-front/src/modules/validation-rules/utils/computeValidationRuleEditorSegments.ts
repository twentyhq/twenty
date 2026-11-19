import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

import { type ValidationRuleEditorSegment } from '@/validation-rules/types/ValidationRuleEditorSegment';

type TextRange = { start: number; end: number };

export const computeValidationRuleEditorSegments = ({
  expression,
  isFieldPath,
  cursorOffset,
  fieldRanges,
}: {
  expression: string;
  isFieldPath: (path: string) => boolean;
  cursorOffset: number | null;
  fieldRanges: TextRange[];
}): ValidationRuleEditorSegment[] =>
  tokenizeValidationRuleExpression(expression).reduce<
    ValidationRuleEditorSegment[]
  >((segments, token) => {
    const isAlreadyField = fieldRanges.some(
      (range) => range.start === token.start && range.end === token.end,
    );
    const isBeingTyped =
      isDefined(cursorOffset) &&
      cursorOffset > token.start &&
      cursorOffset <= token.end;

    if (
      token.type === 'path' &&
      isFieldPath(token.text) &&
      (isAlreadyField || !isBeingTyped)
    ) {
      return [...segments, { type: 'field', path: token.text }];
    }

    const lastSegment = segments.at(-1);

    if (lastSegment?.type === 'text') {
      return [
        ...segments.slice(0, -1),
        { type: 'text', text: lastSegment.text + token.text },
      ];
    }

    return [...segments, { type: 'text', text: token.text }];
  }, []);
