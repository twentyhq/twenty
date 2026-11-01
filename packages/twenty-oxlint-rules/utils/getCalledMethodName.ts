export const getCalledMethodName = (callee: any): string | undefined => {
  if (callee?.type !== 'MemberExpression' || callee.computed) {
    return undefined;
  }

  return callee.property?.type === 'Identifier'
    ? callee.property.name
    : undefined;
};
