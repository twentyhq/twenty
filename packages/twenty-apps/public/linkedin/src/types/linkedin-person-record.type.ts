export type LinkedinPersonRecord = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  company?: { name?: string | null } | null;
};
