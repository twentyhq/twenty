import { defineView, ViewType } from 'twenty-sdk/define';

import {
  WHATSAPP_CAMPAIGN_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGNS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const VIEW_FIELD_ORDER = [
  'name',
  'template',
  'scheduledAt',
  'queuedCount',
  'sentCount',
  'deliveredCount',
  'readCount',
  'repliedCount',
  'failedCount',
  'skippedCount',
] as const;

export default defineView({
  universalIdentifier: WHATSAPP_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All WhatsApp campaigns',
  objectUniversalIdentifier: WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  icon: 'IconSpeakerphone',
  type: ViewType.TABLE,
  position: 0,
  fields: VIEW_FIELD_ORDER.map((fieldName, position) => ({
    universalIdentifier: WHATSAPP_CAMPAIGNS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS[fieldName],
    fieldMetadataUniversalIdentifier: WHATSAPP_CAMPAIGN_FIELD_UNIVERSAL_IDENTIFIERS[fieldName],
    position,
    isVisible: true,
    size: fieldName === 'name' ? 240 : 120,
  })),
});
