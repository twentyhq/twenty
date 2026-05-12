// Detects permission/scope errors from email provider APIs (Google, Microsoft).
// These typically occur when the OAuth consent didn't include the required
// scope for the operation (e.g., gmail.compose for drafts).
export const isInsufficientPermissionsError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes('insufficient permission') ||
    message.includes('insufficient authentication scopes') ||
    message.includes('access denied') ||
    message.includes('forbidden')
  ) {
    return true;
  }

  const response = (error as { response?: { status?: number } }).response;

  return response?.status === 401 || response?.status === 403;
};
