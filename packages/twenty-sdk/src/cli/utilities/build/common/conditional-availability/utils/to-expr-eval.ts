export const toExprEval = (raw: string): string =>
  raw
    .replace(/!==/g, '!=')
    .replace(/===/g, '==')
    .replace(/&&/g, 'and')
    .replace(/\|\|/g, 'or')
    .replace(/!(?!=)/g, 'not ');
