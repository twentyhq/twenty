// The sending domain of an email channel: everything after the last '@' of its
// source address, lowercased. Mirrors the server's emailing-domain matching.
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
