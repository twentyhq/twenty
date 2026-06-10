import { isNonEmptyString } from '@sniptt/guards';

export type RawCampaignRecipient = {
  personId: string;
  email: string | null;
};

export type CampaignRecipient = {
  personId: string;
  email: string;
};

export type CampaignSkippedBreakdown = {
  noEmail: number;
  deduped: number;
  overCap: number;
};

// Turns resolved people into a deduped, capped recipient list and reports what
// was dropped: people with no email, duplicate emails, and anyone past the cap.
export const normalizeCampaignRecipients = (
  rawRecipients: RawCampaignRecipient[],
  maxRecipients: number,
): { recipients: CampaignRecipient[]; skipped: CampaignSkippedBreakdown } => {
  const skipped: CampaignSkippedBreakdown = {
    noEmail: 0,
    deduped: 0,
    overCap: 0,
  };
  const seenEmails = new Set<string>();
  const recipients: CampaignRecipient[] = [];

  for (const candidate of rawRecipients) {
    const normalizedEmail = candidate.email?.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmail)) {
      skipped.noEmail += 1;
      continue;
    }

    if (seenEmails.has(normalizedEmail)) {
      skipped.deduped += 1;
      continue;
    }

    seenEmails.add(normalizedEmail);

    if (recipients.length >= maxRecipients) {
      skipped.overCap += 1;
      continue;
    }

    recipients.push({ email: normalizedEmail, personId: candidate.personId });
  }

  return { recipients, skipped };
};
