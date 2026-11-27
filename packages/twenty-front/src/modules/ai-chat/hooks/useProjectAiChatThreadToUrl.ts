import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai-chat/constants/AiChatNewThreadPathSegment';
import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { matchInboxPath } from '@/ai-chat/utils/matchInboxPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectAiChatThreadToUrl = useCallback(
    (threadId: string) => {
      const pathname = window.location.pathname;
      const inboxRecordRouteObjectNames = store.get(
        inboxRecordRouteObjectNamesSelector.atom,
      );
      const inboxPathMatch = matchInboxPath({
        pathname,
        inboxRecordRouteObjectNames,
      });
      const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);

      if (isDefined(inboxPathMatch)) {
        const inboxThreadId = isNewChat
          ? AI_CHAT_NEW_THREAD_PATH_SEGMENT
          : threadId;
        const options = {
          replace: isDefined(inboxPathMatch.threadId),
          state: getCurrentHistoryEntryState(),
        };

        if (
          !isDefined(inboxRecordRouteObjectNames) ||
          !inboxPathMatch.isRecordRoute
        ) {
          navigateApp(
            AppPath.AiChatInbox,
            { threadId: inboxThreadId },
            undefined,
            options,
          );

          return;
        }

        const viewId = new URLSearchParams(window.location.search).get(
          'viewId',
        );

        navigateApp(
          AppPath.RecordShowPage,
          {
            objectNameSingular: inboxRecordRouteObjectNames.nameSingular,
            objectRecordId: inboxThreadId,
          },
          isNonEmptyString(viewId) ? { viewId } : undefined,
          options,
        );

        return;
      }

      if (!isAiChatPath(pathname)) {
        return;
      }

      const aiChatPageRoute = getAiChatPageRoute({
        isInbox: false,
        threadId: isNewChat ? null : threadId,
      });

      navigateApp(
        aiChatPageRoute.appPath,
        { threadId: aiChatPageRoute.threadId },
        undefined,
        { replace: true, state: getCurrentHistoryEntryState() },
      );
    },
    [navigateApp, store],
  );

  return { projectAiChatThreadToUrl };
};
