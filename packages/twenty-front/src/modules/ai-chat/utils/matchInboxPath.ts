import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';

type InboxPathMatch = {
  threadId: string | undefined;
  isRecordRoute: boolean;
};

export const matchInboxPath = ({
  pathname,
  inboxRecordRouteObjectNames,
}: {
  pathname: string;
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null;
}): InboxPathMatch | null => {
  const legacyInboxMatch = matchPath(AppPath.AiChatInbox, pathname);

  if (isDefined(legacyInboxMatch)) {
    return { threadId: legacyInboxMatch.params.threadId, isRecordRoute: false };
  }

  if (!isDefined(inboxRecordRouteObjectNames)) {
    return null;
  }

  const recordShowMatch = matchPath(AppPath.RecordShowPage, pathname);

  if (
    recordShowMatch?.params.objectNameSingular ===
    inboxRecordRouteObjectNames.nameSingular
  ) {
    return {
      threadId: recordShowMatch.params.objectRecordId,
      isRecordRoute: true,
    };
  }

  const recordIndexMatch = matchPath(AppPath.RecordIndexPage, pathname);

  if (
    recordIndexMatch?.params.objectNamePlural ===
    inboxRecordRouteObjectNames.namePlural
  ) {
    return { threadId: undefined, isRecordRoute: true };
  }

  return null;
};
