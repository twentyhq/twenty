import { isDefined } from 'twenty-shared/utils';

import { type InboxItemToolCall } from '~/generated/graphql';

// The editor works in strings, like any form; the edited input wins over the
// proposal once the person has touched the call. A nested value is shown as
// the JSON it is, since no single control can stand for an arbitrary shape.
export const getInboxToolCallInputAsStrings = (
  toolCall: Pick<InboxItemToolCall, 'proposedInput' | 'editedInput'>,
): Record<string, string> => {
  const input = (toolCall.editedInput ??
    toolCall.proposedInput ??
    {}) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, toEditableString(value)]),
  );
};

const toEditableString = (value: unknown): string => {
  if (!isDefined(value)) {
    return '';
  }

  return typeof value === 'object'
    ? JSON.stringify(value, null, 2)
    : String(value);
};
