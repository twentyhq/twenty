export class CompanyEnrichError extends Error {}

export const executeOperation = async <TResult>(
  operation: () => Promise<TResult>,
) => {
  try {
    return await operation();
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof CompanyEnrichError
          ? error.message
          : 'The operation could not be completed. Check your app settings and record permissions. No automatic retry was made.',
    };
  }
};
