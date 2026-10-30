export const isLinariaTag = (tag: any): boolean => {
  if (tag?.type === 'Identifier') {
    return tag.name === 'css' || tag.name === 'styled';
  }

  if (tag?.type === 'MemberExpression') {
    return isLinariaTag(tag.object);
  }

  if (tag?.type === 'CallExpression') {
    return isLinariaTag(tag.callee);
  }

  return false;
};
