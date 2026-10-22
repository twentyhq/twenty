import { type Content } from '@tiptap/core';
import { Marked, type TokenizerAndRendererExtension } from 'marked';

const VARIABLE_TAG_MARKDOWN_EXTENSION: TokenizerAndRendererExtension = {
  name: 'variableTag',
  level: 'inline',
  start: (source) => source.indexOf('{{'),
  tokenizer: (source) => {
    const match = /^{{[^{}]+}}/.exec(source);

    return match ? { type: 'variableTag', raw: match[0] } : undefined;
  },
  renderer: ({ raw }) => {
    const variableTagElement = document.createElement('span');

    variableTagElement.dataset.type = 'variableTag';
    variableTagElement.dataset.variable = raw;

    return variableTagElement.outerHTML;
  },
};

export const parseLegacyMarkdownDocumentWithVariables = (
  serializedDocument: string,
): Content =>
  new Marked({ extensions: [VARIABLE_TAG_MARKDOWN_EXTENSION] }).parse(
    serializedDocument,
    { async: false },
  );
