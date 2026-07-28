export type ApplicationDisplayData = {
  id?: string | null;
  name?: string | null;
  universalIdentifier?: string | null;
  // Resolved display url (the `logoUrl` resolve field of the application or of
  // its registration). The raw `logo` manifest path is package-relative and is
  // never displayable on its own.
  logoUrl?: string | null;
};
