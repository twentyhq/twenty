import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';

export const useNavigateToInboxThread = () => {
  const navigate = useNavigateApp();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get('viewId');

  const navigateToInboxThread = useCallback(
    ({
      threadId,
      replace = false,
    }: {
      threadId: string | null;
      replace?: boolean;
    }) => {
      const options = { replace, state: getCurrentHistoryEntryState() };

      if (!isDefined(inboxRecordRouteObjectNames)) {
        // oxlint-disable-next-line twenty/no-navigate-prefer-link
        navigate(AppPath.AiChatInbox, { threadId }, undefined, options);

        return;
      }

      const queryParams = isNonEmptyString(viewId) ? { viewId } : undefined;

      if (!isNonEmptyString(threadId)) {
        // oxlint-disable-next-line twenty/no-navigate-prefer-link
        navigate(
          AppPath.RecordIndexPage,
          { objectNamePlural: inboxRecordRouteObjectNames.namePlural },
          queryParams,
          options,
        );

        return;
      }

      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(
        AppPath.RecordShowPage,
        {
          objectNameSingular: inboxRecordRouteObjectNames.nameSingular,
          objectRecordId: threadId,
        },
        queryParams,
        options,
      );
    },
    [inboxRecordRouteObjectNames, navigate, viewId],
  );

  return { navigateToInboxThread };
};
