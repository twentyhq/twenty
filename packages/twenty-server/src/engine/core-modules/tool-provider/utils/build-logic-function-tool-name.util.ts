export const buildLogicFunctionToolName = (functionName: string): string =>
  `app_${functionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
