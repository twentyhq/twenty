import { type JSONContent } from '@tiptap/core';

export const parseLegacyPlainTextDocument = (
  serializedDocument: string,
): JSONContent => {
  const content = serializedDocument
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .flatMap((line, index, lines) => [
      ...(line === '' ? [] : [{ type: 'text', text: line }]),
      ...(index === lines.length - 1 ? [] : [{ type: 'hardBreak' }]),
    ]);

  return {
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  };
};
