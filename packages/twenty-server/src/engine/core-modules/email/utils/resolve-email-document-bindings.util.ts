import {
  type EmailDocument,
  type EmailDocumentNode,
  type EmailDocumentStringContext,
  TIPTAP_NODE_TYPES,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

const textToInlineNodes = (
  text: string,
  marks?: EmailDocumentNode['marks'],
): EmailDocumentNode[] =>
  text.split('\n').flatMap((line, index, lines) => [
    ...(line === ''
      ? []
      : [
          {
            type: TIPTAP_NODE_TYPES.TEXT,
            text: line,
            ...(marks && { marks }),
          } satisfies EmailDocumentNode,
        ]),
    ...(index < lines.length - 1
      ? [
          {
            type: TIPTAP_NODE_TYPES.HARD_BREAK,
            ...(marks && { marks }),
          } satisfies EmailDocumentNode,
        ]
      : []),
  ]);

const resolveNode = (
  node: EmailDocumentNode,
  resolve: (value: string, context: EmailDocumentStringContext) => string,
): EmailDocumentNode[] => {
  if (node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG) {
    const variable = node.attrs?.variable;

    if (typeof variable !== 'string') {
      return [node];
    }

    const resolvedNode = transformEmailDocumentStrings(
      {
        type: TIPTAP_NODE_TYPES.TEXT,
        marks: node.marks,
      },
      resolve,
    );

    return textToInlineNodes(resolve(variable, 'text'), resolvedNode.marks);
  }

  if (node.type === TIPTAP_NODE_TYPES.TEXT && typeof node.text === 'string') {
    const resolvedNode = transformEmailDocumentStrings(node, (value, context) =>
      context === 'text' ? value : resolve(value, context),
    );

    return textToInlineNodes(resolve(node.text, 'text'), resolvedNode.marks);
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
