import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';

import { useRefreshShownInboxThreadList } from '@/inbox/hooks/useRefreshShownInboxThreadList';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenInboxPresetFilter = (
  recordSelectionInstanceId?: string,
) => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { resetRecordSelection } = useResetRecordSelection(
    recordSelectionInstanceId,
  );
  const { refreshShownInboxThreadList } = useRefreshShownInboxThreadList();

  const openInboxPresetFilter = useCallback(
    (presetFilter: AgentChatThreadPresetFilter) => {
      resetRecordSelection();
      store.set(inboxSelectedThreadListSourceState.atom, {
        type: 'presetFilter',
        presetFilter,
      });
      refreshShownInboxThreadList();
      navigate(AppPath.AiChatInbox, { threadId: null });
    },
    [navigate, refreshShownInboxThreadList, resetRecordSelection, store],
  );

  return { openInboxPresetFilter };
};
