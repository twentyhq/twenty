import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelAiChatPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';
import { useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { aiChatPickerOpenErrorComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpenErrorComponentState';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { aiChatPickerUnavailableThreadIdsComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerUnavailableThreadIdsComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
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

type SidePanelAiChatPickerListProps = {
  threads: Pick<AgentChatThreadRecord, 'id' | 'title'>[];
  isLoading: boolean;
  loadingLabel: string;
  noResultsText: string;
  errorAction?: ReactNode;
  footer?: ReactNode;
};

export const SidePanelAiChatPickerList = ({
  threads,
  isLoading,
  loadingLabel,
  noResultsText,
  errorAction,
  footer,
}: SidePanelAiChatPickerListProps) => {
  const { t } = useLingui();
  const { actions: headerActionsPortal } = useWorkspaceSurfaceHeaderPortal();
  const { openAiChatFromPicker } = useOpenAiChatFromPicker();
  const aiChatPickerOpeningThreadId = useAtomComponentStateValue(
    aiChatPickerOpeningThreadIdComponentState,
  );
  const aiChatPickerOpenError = useAtomComponentStateValue(
    aiChatPickerOpenErrorComponentState,
  );
  const aiChatPickerUnavailableThreadIds = useAtomComponentStateValue(
    aiChatPickerUnavailableThreadIdsComponentState,
  );
  const isOpeningThread = isDefined(aiChatPickerOpeningThreadId);
  const hasError = isDefined(errorAction);
  const canShowThreads = !isLoading && !hasError;
  const visibleThreads = threads.filter(
    ({ id }) => !aiChatPickerUnavailableThreadIds.includes(id),
  );
  const hasThreads = isNonEmptyArray(visibleThreads);
  const visibleOpenError =
    canShowThreads &&
    threads.some(({ id }) => id === aiChatPickerOpenError?.threadId)
      ? aiChatPickerOpenError
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
          <SidePanelAiChatPickerSkeleton label={loadingLabel} />
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
            <SelectableListItem
              key={thread.id}
              itemId={thread.id}
              onEnter={
                isOpeningThread
                  ? undefined
                  : () => void openAiChatFromPicker(thread.id)
              }
            >
              <CommandMenuItem
                id={thread.id}
                Icon={IconMessage}
                label={
                  isNonEmptyString(thread.title) ? thread.title : t`New chat`
                }
                disabled={isOpeningThread}
                onClick={() => void openAiChatFromPicker(thread.id)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      )}
      {canShowThreads && footer}
    </SidePanelList>
  );
};
