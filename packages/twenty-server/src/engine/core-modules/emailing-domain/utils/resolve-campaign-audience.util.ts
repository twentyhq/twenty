import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';

export const resolveCampaignAudience = ({
  rawRecipients,
  totalMemberCount,
  maxRecipients,
  hardSuppressedEmails,
  globallySuppressedEmails,
  topicSuppressedEmails,
}: {
  rawRecipients: RawCampaignRecipient[];
  totalMemberCount: number;
  maxRecipients: number;
  hardSuppressedEmails: Set<string>;
  globallySuppressedEmails: Set<string>;
  topicSuppressedEmails: Set<string>;
}): CampaignAudienceResolution => {
  const { recipients, skipped } = normalizeCampaignRecipients(rawRecipients);

  const sendableRecipients: CampaignRecipient[] = [];
  const excluded = { hardSuppressed: 0, globally: 0, byTopic: 0 };
  let overCap = 0;

  for (const recipient of recipients) {
    if (hardSuppressedEmails.has(recipient.email)) {
      excluded.hardSuppressed += 1;
      continue;
    }

    if (globallySuppressedEmails.has(recipient.email)) {
      excluded.globally += 1;
      continue;
    }

    if (topicSuppressedEmails.has(recipient.email)) {
      excluded.byTopic += 1;
      continue;
    }

    if (sendableRecipients.length >= maxRecipients) {
      overCap += 1;
      continue;
    }

    sendableRecipients.push(recipient);
  }

  return {
    sendableRecipients,
    audience: {
      totalMembers: totalMemberCount,
      withoutEmail: skipped.noEmail,
      duplicateEmails: skipped.deduped,
      overCap,
      hardSuppressed: excluded.hardSuppressed,
      globallyUnsubscribed: excluded.globally,
      topicUnsubscribed: excluded.byTopic,
      sendable: sendableRecipients.length,
    },
  };
};
