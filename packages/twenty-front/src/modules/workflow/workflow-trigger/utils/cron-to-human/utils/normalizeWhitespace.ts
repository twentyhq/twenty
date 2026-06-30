export const normalizeWhitespace = (expression: string): string => {
  return expression.trim().replace(/\s+/g, ' ');
};
