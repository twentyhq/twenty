export type PersonNode = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: { primaryPhoneNumber?: string | null } | null;
  jobTitle?: string | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  company?: { id?: string | null; name?: string | null } | null;
  pdlId?: string | null;
  pdlLastEnrichedAt?: string | null;
};
