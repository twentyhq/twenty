import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';

import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';

export const useNavigateToInboxThread = () => {
  const navigate = useNavigateApp();

  const navigateToInboxThread = useCallback(
    ({
      threadId,
      replace = false,
    }: {
      threadId: string | null;
      replace?: boolean;
    }) =>
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(AppPath.AiChatInbox, { threadId }, undefined, {
        replace,
        state: getCurrentHistoryEntryState(),
      }),
    [navigate],
  );

  return { navigateToInboxThread };
};
