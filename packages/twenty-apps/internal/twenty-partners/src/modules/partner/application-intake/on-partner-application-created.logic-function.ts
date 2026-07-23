import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_PARTNER_APPLICATION_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { DISCORD_WEBHOOK_ENV_VAR } from 'src/modules/partner/application-intake/connector/discord/config';
import { notifyPartnerApplication } from 'src/modules/partner/application-intake/services/notify-partner-application.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Partner>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  // Form-only: the installed app stamps createdBy.source = 'APPLICATION'.
  // Seed/import authenticate via API key (API); the UI is MANUAL — both skipped.
  if (after.createdBy?.source !== 'APPLICATION') return {};

  const webhookUrl = process.env[DISCORD_WEBHOOK_ENV_VAR];
  if (!isNonEmptyString(webhookUrl)) return {};

  return notifyPartnerApplication(after.id, webhookUrl);
};

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_APPLICATION_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-application-created',
  description:
    'Posts a Discord notification when the partner application form creates a new Partner.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'partner.created',
  },
});
