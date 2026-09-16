import { isNonEmptyString } from '@sniptt/guards';

import { type InboxEmailComposerPrefill } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';

// What the composer holds, in the shape the email tool runs with. Blank
// optionals are left out so the tool applies its own defaults rather than
// receiving an empty account or reply header.
export const buildEmailToolCallInput = ({
  to,
  cc,
  bcc,
  subject,
  body,
  connectedAccountId,
  fromHandle,
  inReplyTo,
}: InboxEmailComposerPrefill): Record<string, unknown> => ({
  recipients: { to, cc, bcc },
  subject,
  body,
  ...(isNonEmptyString(connectedAccountId) ? { connectedAccountId } : {}),
  ...(isNonEmptyString(fromHandle) ? { fromHandle } : {}),
  ...(isNonEmptyString(inReplyTo) ? { inReplyTo } : {}),
});
