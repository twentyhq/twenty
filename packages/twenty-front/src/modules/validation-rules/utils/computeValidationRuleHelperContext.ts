import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperContext } from '@/validation-rules/types/ValidationRuleHelperContext';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';
import { getValidationRuleFunctionDefinitions } from '@/validation-rules/utils/getValidationRuleFunctionDefinitions';

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
  functionDefinitions,
}: {
  query: string;
  fields: ValidationRuleEditorField[];
  functionDefinitions: ValidationRuleSyntaxDefinition[];
}): ValidationRuleHelperItem[] => {
  const fieldItems: ValidationRuleHelperItem[] = fields
    .filter((field) => !field.path.includes('.'))
    .filter((field) => !field.isSystem || query.length > 0)
    .filter((field) => matchesQuery([field.path, field.label], query))
    .map((field) => ({ kind: 'field', field }));

  const functionItems: ValidationRuleHelperItem[] = functionDefinitions
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
  functionDefinitions = getValidationRuleFunctionDefinitions(),
}: {
  textBeforeCursor: string;
  isCursorAfterField: boolean;
  fields: ValidationRuleEditorField[];
  functionDefinitions?: ValidationRuleSyntaxDefinition[];
}): ValidationRuleHelperContext => {
  const cursorOffset = textBeforeCursor.length;
  const lastToken = tokenizeValidationRuleExpression(textBeforeCursor).at(-1);

  if (lastToken?.type === 'unclosedString') {
    return { replaceFromOffset: cursorOffset, items: [] };
  }

  if (isCursorAfterField) {
    return {
      replaceFromOffset: cursorOffset,
      items: computeRootItems({ query: '', fields, functionDefinitions }),
    };
  }

  const [, parentPath, partialWord = ''] =
    textBeforeCursor.match(WORD_BEFORE_CURSOR_PATTERN) ?? [];

  if (!isDefined(parentPath)) {
    return {
      replaceFromOffset: cursorOffset - partialWord.length,
      items: computeRootItems({
        query: partialWord,
        fields,
        functionDefinitions,
      }),
    };
  }

  const isPreviousValueContainer =
    parentPath === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME;
  const parentField = fields.find((field) => field.path === parentPath);

  if (
    !isPreviousValueContainer &&
    (!isDefined(parentField) || !parentField.hasMembers)
  ) {
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
      .filter(
        (field) =>
          !isPreviousValueContainer ||
          !field.isSystem ||
          partialWord.length > 0,
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
