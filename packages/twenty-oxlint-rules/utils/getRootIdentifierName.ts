export const getRootIdentifierName = (node: any): string | undefined => {
  if (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') {
    return node.name;
  }

  if (
    node?.type === 'MemberExpression' ||
    node?.type === 'JSXMemberExpression'
  ) {
    return getRootIdentifierName(node.object);
  }

  return undefined;
};
