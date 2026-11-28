import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';

export const getInboxPath = ({
  threadId,
  inboxRecordRouteObjectNames,
  queryParams,
}: {
  threadId: string | null;
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null;
  queryParams?: Record<string, string>;
}) => {
  if (!isDefined(inboxRecordRouteObjectNames)) {
    return getAppPath(AppPath.AiChatInbox, { threadId }, queryParams);
  }

  if (!isNonEmptyString(threadId)) {
    return getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: inboxRecordRouteObjectNames.namePlural },
      queryParams,
    );
  }

  return getAppPath(
    AppPath.RecordShowPage,
    {
      objectNameSingular: inboxRecordRouteObjectNames.nameSingular,
      objectRecordId: threadId,
    },
    queryParams,
  );
};
