export const generateErrorSuggestion = (
  _toolName: string,
  errorMessage: string,
): string => {
  const lowerError = errorMessage.toLowerCase();

  if (
    lowerError.includes('not found') ||
    lowerError.includes('does not exist')
  ) {
    return 'Verify the ID or name exists with a search query first';
  }

  if (
    lowerError.includes('permission') ||
    lowerError.includes('forbidden') ||
    lowerError.includes('unauthorized')
  ) {
    return 'This operation requires elevated permissions or a different role';
  }

  if (lowerError.includes('invalid') || lowerError.includes('validation')) {
    return 'Check the tool schema for valid parameter formats and types';
  }

  if (
    lowerError.includes('duplicate') ||
    lowerError.includes('already exists')
  ) {
    return 'A record with this identifier already exists. Try updating instead of creating';
  }

  if (lowerError.includes('required') || lowerError.includes('missing')) {
    return 'Required fields are missing. Check which fields are mandatory for this operation';
  }

  return 'Try adjusting the parameters or using a different approach';
};

export const wrapWithErrorHandler = (
  toolName: string,
  executeFn: (args: Record<string, unknown>) => Promise<unknown>,
): ((args: Record<string, unknown>) => Promise<unknown>) => {
  return async (args: Record<string, unknown>) => {
    try {
      return await executeFn(args);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: {
          message: errorMessage,
          tool: toolName,
          suggestion: generateErrorSuggestion(toolName, errorMessage),
        },
      };
    }
  };
};
