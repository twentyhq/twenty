import {
  type EmailDocument,
  type EmailDocumentNode,
  type EmailDocumentStringContext,
  TIPTAP_NODE_TYPES,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

const textToInlineNodes = (text: string): EmailDocumentNode[] =>
  text.split('\n').flatMap((line, index, lines) => [
    ...(line === ''
      ? []
      : [
          {
            type: TIPTAP_NODE_TYPES.TEXT,
            text: line,
          } satisfies EmailDocumentNode,
        ]),
    ...(index < lines.length - 1
      ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK } satisfies EmailDocumentNode]
      : []),
  ]);

const resolveNode = (
  node: EmailDocumentNode,
  resolve: (value: string, context: EmailDocumentStringContext) => string,
): EmailDocumentNode[] => {
  if (node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG) {
    const variable = node.attrs?.variable;

    return textToInlineNodes(
      typeof variable === 'string' ? resolve(variable, 'text') : '',
    );
  }

  const { content, ...nodeWithoutContent } = node;
  const resolvedNode = transformEmailDocumentStrings(
    nodeWithoutContent,
    resolve,
  );

  return [
    {
      ...resolvedNode,
      ...(content && {
        content: content.flatMap((childNode) =>
          resolveNode(childNode, resolve),
        ),
      }),
    },
  ];
};

export const resolveEmailDocumentBindings = (
  document: EmailDocument,
  resolve: (value: string, context: EmailDocumentStringContext) => string,
): EmailDocument => {
  const [resolvedDocument] = resolveNode(document, resolve);

  return resolvedDocument as EmailDocument;
};
