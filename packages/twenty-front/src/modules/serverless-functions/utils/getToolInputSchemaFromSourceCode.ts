export const getToolInputSchemaFromSourceCode = async (
  sourceCode: string,
): Promise<object | null> => {
  const { getFunctionInputSchema } = await import('./getFunctionInputSchema');
  const inputSchema = getFunctionInputSchema(sourceCode);

  // Serverless functions take a single params object
  const firstParam = inputSchema[0];

  if (firstParam?.type === 'object' && firstParam.properties) {
    return {
      type: 'object',
      properties: firstParam.properties,
    };
  }

  return null;
};
