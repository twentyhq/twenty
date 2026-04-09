export const generateInsertStatement = (
  insertPrefix: string,
  formattedValues: string[],
): string => `${insertPrefix}(${formattedValues.join(', ')});\n`;
