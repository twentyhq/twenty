export type ApplicationDisplayData = {
  id?: string | null;
  name?: string | null;
  universalIdentifier?: string | null;
  logo?: string | null;
  // Resolved display url (the registration's logoUrl resolve field); takes
  // precedence over the logo computed from the installed application.
  logoUrl?: string | null;
};
