import { type Monaco } from '@monaco-editor/react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { VALIDATION_RULE_FUNCTION_NAMES } from '@/validation-rules/constants/ValidationRuleFunctionNames';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import { VALIDATION_RULE_LANGUAGE_ID } from '@/validation-rules/constants/ValidationRuleLanguageId';
import { computeValidationRuleCompletionLabels } from '@/validation-rules/utils/computeValidationRuleCompletionLabels';

const fieldsByModelUri = new Map<string, ValidationRuleFieldDescriptor[]>();

export const setValidationRuleEditorFields = ({
  modelUri,
  fields,
}: {
  modelUri: string;
  fields: ValidationRuleFieldDescriptor[];
}) => {
  fieldsByModelUri.set(modelUri, fields);
};

export const unsetValidationRuleEditorFields = (modelUri: string) => {
  fieldsByModelUri.delete(modelUri);
};

export const registerValidationRuleLanguage = (monaco: Monaco) => {
  const isAlreadyRegistered = monaco.languages
    .getLanguages()
    .some((language) => language.id === VALIDATION_RULE_LANGUAGE_ID);

  if (isAlreadyRegistered) {
    return;
  }

  monaco.languages.register({ id: VALIDATION_RULE_LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(VALIDATION_RULE_LANGUAGE_ID, {
    keywords: [...VALIDATION_RULE_KEYWORDS],
    functions: [...VALIDATION_RULE_FUNCTION_NAMES],
    tokenizer: {
      root: [
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@functions': 'type.identifier',
              '@default': 'identifier',
            },
          },
        ],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\d+(\.\d+)?/, 'number'],
        [/[=!<>]=?|[+\-*/%]|\|\|/, 'operator'],
      ],
    },
  });

  monaco.languages.registerCompletionItemProvider(VALIDATION_RULE_LANGUAGE_ID, {
    triggerCharacters: ['.'],
    provideCompletionItems: (model, position) => {
      const fields = fieldsByModelUri.get(model.uri.toString());

      if (!isDefined(fields)) {
        return { suggestions: [] };
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      return {
        suggestions: computeValidationRuleCompletionLabels({
          textBeforeCursor,
          fields,
        }).map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: label,
          range,
        })),
      };
    },
  });
};
