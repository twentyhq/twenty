import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type InboxItemToolCall } from '~/generated/graphql';

export type InboxEmailComposerPrefill = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  connectedAccountId?: string;
  fromHandle?: string;
  inReplyTo?: string;
};

const readString = (value: unknown): string => (isString(value) ? value : '');

const readOptionalString = (value: unknown): string | undefined =>
  isString(value) && value.length > 0 ? value : undefined;

// The editor edits a string. A body proposed as a structured document is
// carried as its JSON, which the editor's document parser reads back.
const readBody = (value: unknown): string => {
  if (isString(value)) {
    return value;
  }

  return isDefined(value) ? JSON.stringify(value) : '';
};

// The email tool takes recipients as one nested object; older proposals put
// them at the top level. Both read into the composer the same way.
export const getEmailComposerPrefillFromToolCall = (
  toolCall: Pick<InboxItemToolCall, 'proposedInput' | 'editedInput'>,
): InboxEmailComposerPrefill => {
  const input = (toolCall.editedInput ??
    toolCall.proposedInput ??
    {}) as Record<string, unknown>;
  const recipients = isPlainObject(input.recipients)
    ? (input.recipients as Record<string, unknown>)
    : input;

  return {
    to: readString(recipients.to),
    cc: readString(recipients.cc),
    bcc: readString(recipients.bcc),
    subject: readString(input.subject),
    body: readBody(input.body),
    connectedAccountId: readOptionalString(input.connectedAccountId),
    fromHandle: readOptionalString(input.fromHandle),
    inReplyTo: readOptionalString(input.inReplyTo),
  };
};
