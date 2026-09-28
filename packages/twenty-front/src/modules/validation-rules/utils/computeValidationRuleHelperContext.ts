import { isDefined } from 'twenty-shared/utils';

import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperContext } from '@/validation-rules/types/ValidationRuleHelperContext';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { getValidationRuleFunctionDefinitions } from '@/validation-rules/utils/getValidationRuleFunctionDefinitions';
import { tokenizeValidationRuleExpression } from '@/validation-rules/utils/tokenizeValidationRuleExpression';

const WORD_BEFORE_CURSOR_PATTERN =
  /(?:([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.)?([A-Za-z_$][\w$]*)?$/;

const matchesQuery = (candidates: string[], query: string) =>
  candidates.some((candidate) =>
    candidate.toLowerCase().includes(query.toLowerCase()),
  );

const getLastPathSegment = (path: string) => path.split('.').at(-1) ?? path;

const computeRootItems = ({
  query,
  fields,
}: {
  query: string;
  fields: ValidationRuleEditorField[];
}): ValidationRuleHelperItem[] => {
  const fieldItems: ValidationRuleHelperItem[] = fields
    .filter((field) => !field.path.includes('.'))
    .filter((field) => !field.isSystem || query.length > 0)
    .filter((field) => matchesQuery([field.path, field.label], query))
    .map((field) => ({ kind: 'field', field }));

  const functionItems: ValidationRuleHelperItem[] =
    getValidationRuleFunctionDefinitions()
      .filter((definition) => matchesQuery([definition.name], query))
      .map((definition) => ({ kind: 'function', definition }));

  const keywordItems: ValidationRuleHelperItem[] =
    VALIDATION_RULE_KEYWORDS.filter((definition) =>
      matchesQuery([definition.name], query),
    ).map((definition) => ({ kind: 'keyword', definition }));

  return [...fieldItems, ...functionItems, ...keywordItems];
};

export const computeValidationRuleHelperContext = ({
  textBeforeCursor,
  isCursorAfterField,
  fields,
}: {
  textBeforeCursor: string;
  isCursorAfterField: boolean;
  fields: ValidationRuleEditorField[];
}): ValidationRuleHelperContext => {
  const cursorOffset = textBeforeCursor.length;
  const lastToken = tokenizeValidationRuleExpression(textBeforeCursor).at(-1);

  if (lastToken?.type === 'unclosedString') {
    return { replaceFromOffset: cursorOffset, items: [] };
  }

  if (isCursorAfterField) {
    return {
      replaceFromOffset: cursorOffset,
      items: computeRootItems({ query: '', fields }),
    };
  }

  const [, parentPath, partialWord = ''] =
    textBeforeCursor.match(WORD_BEFORE_CURSOR_PATTERN) ?? [];

  if (!isDefined(parentPath)) {
    return {
      replaceFromOffset: cursorOffset - partialWord.length,
      items: computeRootItems({ query: partialWord, fields }),
    };
  }

  const parentField = fields.find((field) => field.path === parentPath);

  if (!isDefined(parentField) || !parentField.hasMembers) {
    return { replaceFromOffset: cursorOffset, items: [] };
  }

  const memberDepth = parentPath.split('.').length + 1;

  return {
    replaceFromOffset:
      cursorOffset - parentPath.length - 1 - partialWord.length,
    items: fields
      .filter(
        (field) =>
          field.path.startsWith(`${parentPath}.`) &&
          field.path.split('.').length === memberDepth,
      )
      .filter((field) =>
        matchesQuery(
          [getLastPathSegment(field.path), field.label],
          partialWord,
        ),
      )
      .map((field) => ({ kind: 'field', field })),
  };
};
