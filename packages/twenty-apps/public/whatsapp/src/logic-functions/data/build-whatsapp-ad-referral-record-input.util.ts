import { type WhatsAppWebhookMessageContent } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type WhatsAppReferral = NonNullable<Extract<WhatsAppWebhookMessageContent, { type: 'text' }>['referral']>;

export const buildWhatsAppAdReferralRecordInput = ({
  referral,
  personId,
  referredAt,
}: {
  referral: WhatsAppReferral;
  personId: string;
  referredAt: Date;
}) => ({
  headline: referral.headline ?? referral.body?.slice(0, 120) ?? 'Click-to-WhatsApp ad',
  sourceId: referral.source_id ?? null,
  sourceType: referral.source_type ?? null,
  sourceUrl: referral.source_url ?? null,
  body: referral.body ?? null,
  mediaType: referral.media_type ?? null,
  ctwaClid: referral.ctwa_clid ?? null,
  referredAt: referredAt.toISOString(),
  personId,
});
