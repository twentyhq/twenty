import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const useOpenInboxChannel = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { resetRecordSelection } = useResetRecordSelection(INBOX_INSTANCE_ID);

  const openInboxChannel = useCallback(
    ({
      channelId,
      channelStatus = AgentChatChannelThreadStatus.OPEN,
      assignment = AgentChatChannelAssignmentFilter.ANY,
      filter = AgentChatChannelThreadFilter.ANY,
    }: Pick<InboxChannelView, 'channelId'> &
      Partial<
        Pick<InboxChannelView, 'channelStatus' | 'assignment' | 'filter'>
      >) => {
      resetRecordSelection();
      store.set(inboxSelectedThreadListSourceState.atom, {
        type: 'channel',
        channelView: { channelId, channelStatus, assignment, filter },
      });
      navigate(AppPath.AiChatInbox, { threadId: null }, undefined, {
        replace: isMatchingPathname(
          window.location.pathname,
          getAppPath(AppPath.AiChatInbox, { threadId: null }),
        ),
      });
    },
    [navigate, resetRecordSelection, store],
  );

  return { openInboxChannel };
};
