export const isCoreApiPermissionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);

  return message.toLowerCase().includes('does not have permission');
};
