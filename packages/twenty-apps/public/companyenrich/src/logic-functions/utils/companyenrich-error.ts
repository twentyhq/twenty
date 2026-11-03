export class CompanyEnrichError extends Error {}

export const executeOperation = async <TResult>(
  operation: () => Promise<TResult>,
) => {
  try {
    return await operation();
  } catch (error) {
    if (!(error instanceof CompanyEnrichError)) {
      // SDK exceptions may embed tokens, response bodies, or CRM data. Retain
      // original source locations for diagnostics without logging that content.
      const locations =
        error instanceof Error
          ? (error.stack ?? '')
              .split('\n')
              .slice(1, 11)
              .flatMap((frame) => {
                const location = frame.match(
                  /[/\\]([a-zA-Z0-9_.-]+):([0-9]+):([0-9]+)\)?$/,
                );
                return location
                  ? [`${location[1]}:${location[2]}:${location[3]}`]
                  : [];
              })
          : [];
      console.error('CompanyEnrich unexpected operation failure', {
        locations,
      });
    }
    return {
      success: false as const,
      error:
        error instanceof CompanyEnrichError
          ? error.message
          : 'The operation could not be completed. Check your app settings and record permissions. No automatic retry was made.',
    };
  }
};
