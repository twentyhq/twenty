export const getEmailChannelDomain = (
  handle: string | null | undefined,
): string | undefined => {
  if (handle === null || handle === undefined) {
    return undefined;
  }

  const lastAtIndex = handle.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return undefined;
  }

  return handle.slice(lastAtIndex + 1).toLowerCase();
};
