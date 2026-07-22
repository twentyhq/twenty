// RFC 5322 display names must be quoted, and an embedded quote or backslash
// would otherwise let a display name break out of the From header.
const escapeDisplayName = (displayName: string): string =>
  displayName.replace(/[\\"]/g, '\\$&');

export const buildFromHeader = (
  emailAddress: string,
  senderDisplayName: string | null | undefined,
): string => {
  const trimmedDisplayName = senderDisplayName?.trim();

  if (
    trimmedDisplayName === undefined ||
    trimmedDisplayName.length === 0 ||
    // eslint-disable-next-line no-control-regex
    /[\r\n\x00]/.test(trimmedDisplayName)
  ) {
    return emailAddress;
  }

  return `"${escapeDisplayName(trimmedDisplayName)}" <${emailAddress}>`;
};
