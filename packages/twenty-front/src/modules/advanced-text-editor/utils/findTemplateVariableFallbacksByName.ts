import { isNonEmptyString, isString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  TIPTAP_NODE_TYPES,
  isDefined,
  parseTemplateVariableWithFallback,
  TEMPLATE_VARIABLE_PATTERN,
} from 'twenty-shared/utils';

type FindTemplateVariableFallbacksByNameArgs = {
  rawContent: string;
  editorContent: JSONContent | undefined;
};

const listEditorContentRawTemplateVariables = (node: JSONContent): string[] => [
  ...(node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG &&
  isString(node.attrs?.variable)
    ? [node.attrs.variable]
    : []),
  ...(node.content ?? []).flatMap(listEditorContentRawTemplateVariables),
];

export const findTemplateVariableFallbacksByName = ({
  rawContent,
  editorContent,
}: FindTemplateVariableFallbacksByNameArgs): Map<string, string> => {
  const rawContentRawTemplateVariables = Array.from(
    rawContent.matchAll(TEMPLATE_VARIABLE_PATTERN),
    ([rawTemplateVariable]) => rawTemplateVariable,
  );
  const editorContentRawTemplateVariables = isDefined(editorContent)
    ? listEditorContentRawTemplateVariables(editorContent)
    : [];
  const fallbacksByName = new Map<string, string>();

  for (const rawTemplateVariable of [
    ...rawContentRawTemplateVariables,
    ...editorContentRawTemplateVariables,
  ]) {
    const templateVariableWithFallback =
      parseTemplateVariableWithFallback(rawTemplateVariable);

    if (
      !isDefined(templateVariableWithFallback) ||
      !isNonEmptyString(templateVariableWithFallback.fallback) ||
      fallbacksByName.has(templateVariableWithFallback.name)
    ) {
      continue;
    }

    fallbacksByName.set(
      templateVariableWithFallback.name,
      templateVariableWithFallback.fallback,
    );
  }

  return fallbacksByName;
};
