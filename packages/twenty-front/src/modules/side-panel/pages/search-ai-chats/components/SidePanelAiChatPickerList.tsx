import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type InboxThreadDisplayIdentity } from '@/ai/types/AgentChatThreadDisplayIdentity';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelInboxPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';
import { SidePanelInboxPickerItem } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerItem';
import { useOpenInboxFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { inboxPickerOpenErrorComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpenErrorComponentState';
import { inboxPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { inboxPickerUnavailableThreadIdsComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerUnavailableThreadIdsComponentState';
import { useWorkspaceSurfaceHeaderPortal } from '@/ui/layout/hooks/useWorkspaceSurfaceHeaderPortal';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledStatus = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-height: ${themeCssVariables.spacing[16]};
  padding: ${themeCssVariables.spacing[2]};
`;

type SidePanelInboxPickerListProps = {
  threads: (InboxThreadDisplayIdentity & { id: string })[];
  isLoading: boolean;
  loadingLabel: string;
  noResultsText: string;
  errorAction?: ReactNode;
  footer?: ReactNode;
};

export const SidePanelInboxPickerList = ({
  threads,
  isLoading,
  loadingLabel,
  noResultsText,
  errorAction,
  footer,
}: SidePanelInboxPickerListProps) => {
  const { t } = useLingui();
  const { actions: headerActionsPortal } = useWorkspaceSurfaceHeaderPortal();
  const { openInboxFromPicker } = useOpenInboxFromPicker();
  const inboxPickerOpeningThreadId = useAtomComponentStateValue(
    inboxPickerOpeningThreadIdComponentState,
  );
  const inboxPickerOpenError = useAtomComponentStateValue(
    inboxPickerOpenErrorComponentState,
  );
  const inboxPickerUnavailableThreadIds = useAtomComponentStateValue(
    inboxPickerUnavailableThreadIdsComponentState,
  );
  const isOpeningThread = isDefined(inboxPickerOpeningThreadId);
  const hasError = isDefined(errorAction);
  const canShowThreads = !isLoading && !hasError;
  const visibleThreads = threads.filter(
    ({ id }) => !inboxPickerUnavailableThreadIds.includes(id),
  );
  const hasThreads = isNonEmptyArray(visibleThreads);
  const visibleOpenError =
    canShowThreads &&
    threads.some(({ id }) => id === inboxPickerOpenError?.threadId)
      ? inboxPickerOpenError
      : null;

  return (
    <SidePanelList
      selectableItemIds={
        canShowThreads ? visibleThreads.map(({ id }) => id) : []
      }
      loading={isLoading}
      noResults={canShowThreads && !hasThreads}
      noResultsText={noResultsText}
    >
      {isLoading && (
        <SidePanelGroup heading={t`Chats`}>
          <SidePanelInboxPickerSkeleton label={loadingLabel} />
        </SidePanelGroup>
      )}
      {!isLoading && hasError && (
        <StyledStatus onMouseDown={(event) => event.preventDefault()}>
          {errorAction}
        </StyledStatus>
      )}
      {isDefined(visibleOpenError) && (
        <StyledStatus role="alert">
          <Text color="secondary">
            {visibleOpenError.isThreadUnavailable
              ? t`This chat is no longer available.`
              : t`This chat could not be opened. Try selecting it again.`}
          </Text>
        </StyledStatus>
      )}
      {isOpeningThread &&
        isDefined(headerActionsPortal) &&
        createPortal(
          <Loader role="status" aria-label={t`Opening chat...`} />,
          headerActionsPortal,
        )}
      {canShowThreads && hasThreads && (
        <SidePanelGroup heading={t`Chats`}>
          {visibleThreads.map((thread) => (
            <SidePanelInboxPickerItem
              key={thread.id}
              thread={thread}
              isOpeningThread={isOpeningThread}
              onOpen={(threadId) => void openInboxFromPicker(threadId)}
            />
          ))}
        </SidePanelGroup>
      )}
      {canShowThreads && footer}
    </SidePanelList>
  );
};
