// Matching on a bare prefix would light up Snoozed for an unknown /inbox/
// snoozed-something, so the comparison stops at a segment boundary.
export const isInboxSectionActive = ({
  pathname,
  inboxSectionPath,
}: {
  pathname: string;
  inboxSectionPath: string;
}): boolean =>
  pathname === inboxSectionPath || pathname.startsWith(`${inboxSectionPath}/`);
