import { isDefined } from 'twenty-shared/utils';

import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';

export const toInboxItemToolCallInput = (
  input: unknown,
): InboxItemToolCallInput | undefined => {
  if (!isDefined(input)) {
    return undefined;
  }

  // The GraphQL scalar accepts any JSON, so a list or a bare string reaches
  // here typed as a record and would otherwise become {"0": ...}
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new InboxException(
      'Expected an object of field values',
      InboxExceptionCode.INVALID_INBOX_ACTION,
    );
  }

  return { ...input } as InboxItemToolCallInput;
};
