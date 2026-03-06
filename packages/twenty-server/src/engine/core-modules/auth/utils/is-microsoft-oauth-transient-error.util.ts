export const isMicrosoftOAuthTransientError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('AADSTS650051');
};
