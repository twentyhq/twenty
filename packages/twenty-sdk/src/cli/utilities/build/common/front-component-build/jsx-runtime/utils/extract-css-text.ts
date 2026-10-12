export const extractCssText = (children: unknown): string => {
  if (typeof children === 'string') {
    return children;
  }

  if (!Array.isArray(children)) {
    return '';
  }

  return children.filter((child) => typeof child === 'string').join('');
};
