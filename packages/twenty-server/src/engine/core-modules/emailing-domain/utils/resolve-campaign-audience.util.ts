import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';

export const resolveCampaignAudience = ({
  rawRecipients,
  maxRecipients,
  globallySuppressedEmails,
  topicSuppressedEmails,
}: {
  rawRecipients: RawCampaignRecipient[];
  maxRecipients: number;
  globallySuppressedEmails: Set<string>;
  topicSuppressedEmails: Set<string>;
}): CampaignAudienceResolution => {
  const { recipients, skipped } = normalizeCampaignRecipients(
    rawRecipients,
    maxRecipients,
  );

  const sendableRecipients: CampaignRecipient[] = [];
  const unsubscribedRecipients = { globally: 0, byTopic: 0 };

  for (const recipient of recipients) {
    if (globallySuppressedEmails.has(recipient.email)) {
      unsubscribedRecipients.globally += 1;
      continue;
    }

    if (topicSuppressedEmails.has(recipient.email)) {
      unsubscribedRecipients.byTopic += 1;
      continue;
    }

    sendableRecipients.push(recipient);
  }

  return {
    sendableRecipients,
    audience: {
      totalMembers: rawRecipients.length,
      withoutEmail: skipped.noEmail,
      duplicateEmails: skipped.deduped,
      overCap: skipped.overCap,
      globallyUnsubscribed: unsubscribedRecipients.globally,
      topicUnsubscribed: unsubscribedRecipients.byTopic,
      sendable: sendableRecipients.length,
    },
  };
};
