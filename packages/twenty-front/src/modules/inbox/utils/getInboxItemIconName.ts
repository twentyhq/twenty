import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  type InboxItem,
  InboxItemContextSourceKind,
} from '~/generated/graphql';

const DEFAULT_INBOX_ITEM_ICON = 'IconInbox';
const AGENT_CHAT_THREAD_ICON = 'IconMessageCircle';

const SOURCE_KIND_ICONS: Record<InboxItemContextSourceKind, string> = {
  [InboxItemContextSourceKind.EMAIL]: 'IconMail',
  [InboxItemContextSourceKind.THREAD]: 'IconMessageCircle',
  [InboxItemContextSourceKind.CALL]: 'IconPhone',
  [InboxItemContextSourceKind.RECORD]: 'IconFile',
};

// What an item is about decides how it is drawn. The producer's own icon wins
// when it named one; otherwise the subject, then where the item came from,
// then the first step of its plan, so a row never shows an empty slot.
export const getInboxItemIconName = ({
  inboxItem,
  subjectObjectIcon,
}: {
  inboxItem: Pick<
    InboxItem,
    'icon' | 'threadId' | 'subjectRecordId' | 'context' | 'toolCalls'
  >;
  subjectObjectIcon: string | null | undefined;
}): string => {
  if (isNonEmptyString(inboxItem.icon)) {
    return inboxItem.icon;
  }

  if (isDefined(inboxItem.threadId)) {
    return AGENT_CHAT_THREAD_ICON;
  }

  if (
    isDefined(inboxItem.subjectRecordId) &&
    isNonEmptyString(subjectObjectIcon)
  ) {
    return subjectObjectIcon;
  }

  const sourceKind = inboxItem.context.source?.kind;

  if (isDefined(sourceKind)) {
    return SOURCE_KIND_ICONS[sourceKind];
  }

  const firstToolIcon = inboxItem.toolCalls.find((toolCall) =>
    isNonEmptyString(toolCall.icon),
  )?.icon;

  return firstToolIcon ?? DEFAULT_INBOX_ITEM_ICON;
};
