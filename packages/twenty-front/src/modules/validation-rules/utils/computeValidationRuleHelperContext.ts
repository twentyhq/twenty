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
  keywordDefinitions,
}: {
  query: string;
  fields: ValidationRuleEditorField[];
  functionDefinitions: ValidationRuleSyntaxDefinition[];
  keywordDefinitions: ValidationRuleSyntaxDefinition[];
}): ValidationRuleHelperItem[] => {
  const fieldItems: ValidationRuleHelperItem[] = fields
    .filter((field) => !field.path.includes('.'))
    .filter((field) => !field.isSystem || query.length > 0)
    .filter((field) => matchesQuery([field.path, field.label], query))
    .map((field) => ({ kind: 'field', field }));

  const functionItems: ValidationRuleHelperItem[] = functionDefinitions
    .filter((definition) => matchesQuery([definition.name], query))
    .map((definition) => ({ kind: 'function', definition }));

  const keywordItems: ValidationRuleHelperItem[] = keywordDefinitions
    .filter((definition) => matchesQuery([definition.name], query))
    .map((definition) => ({ kind: 'keyword', definition }));

  return [...fieldItems, ...functionItems, ...keywordItems];
};

const computeMemberItems = ({
  parentPath,
  fields,
}: {
  parentPath: string;
  fields: ValidationRuleEditorField[];
}): ValidationRuleHelperItem[] => {
  const memberDepth = parentPath.split('.').length + 1;

  return fields
    .filter(
      (field) =>
        field.path.startsWith(`${parentPath}.`) &&
        field.path.split('.').length === memberDepth,
    )
    .map((field) => ({ kind: 'field', field }));
};

export const computeValidationRuleHelperContext = ({
  textBeforeCursor,
  fieldPathBeforeCursor,
  fields,
  functionDefinitions = getValidationRuleFunctionDefinitions(),
  keywordDefinitions = VALIDATION_RULE_KEYWORDS,
}: {
  textBeforeCursor: string;
  fieldPathBeforeCursor?: string;
  fields: ValidationRuleEditorField[];
  functionDefinitions?: ValidationRuleSyntaxDefinition[];
  keywordDefinitions?: ValidationRuleSyntaxDefinition[];
}): ValidationRuleHelperContext => {
  const cursorOffset = textBeforeCursor.length;
  const lastToken = tokenizeValidationRuleExpression(textBeforeCursor).at(-1);

  if (lastToken?.type === 'unclosedString') {
    return { replaceFromOffset: cursorOffset, items: [] };
  }

  if (isDefined(fieldPathBeforeCursor)) {
    const fieldBeforeCursor = fields.find(
      (field) => field.path === fieldPathBeforeCursor,
    );

    // A second chip would merge into one unknown name, so a member replaces the chip it extends
    if (fieldBeforeCursor?.hasMembers) {
      return {
        replaceFromOffset: cursorOffset - fieldPathBeforeCursor.length,
        items: computeMemberItems({
          parentPath: fieldPathBeforeCursor,
          fields,
        }),
      };
    }

    return {
      replaceFromOffset: cursorOffset,
      items: keywordDefinitions.map((definition) => ({
        kind: 'keyword',
        definition,
      })),
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
        keywordDefinitions,
      }),
    };
  }

  const isPreviousValueContainer =
    parentPath === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME &&
    keywordDefinitions.some(
      ({ name }) => name === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME,
    );
  const parentField = fields.find((field) => field.path === parentPath);

  if (
    !isPreviousValueContainer &&
    (!isDefined(parentField) || !parentField.hasMembers)
  ) {
    return { replaceFromOffset: cursorOffset, items: [] };
  }

  return {
    replaceFromOffset:
      cursorOffset - parentPath.length - 1 - partialWord.length,
    items: computeMemberItems({ parentPath, fields }).filter(
      (item) =>
        item.kind !== 'field' ||
        ((!isPreviousValueContainer ||
          !item.field.isSystem ||
          partialWord.length > 0) &&
          matchesQuery(
            [getLastPathSegment(item.field.path), item.field.label],
            partialWord,
          )),
    ),
  };
};
