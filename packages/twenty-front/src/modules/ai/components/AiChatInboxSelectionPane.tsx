import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { Key } from 'ts-key-enum';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { useTargetAiChatThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type AiChatInboxSelectionPaneProps = {
  threads: AgentChatThreadRecord[];
};

export const AiChatInboxSelectionPane = ({
  threads,
}: AiChatInboxSelectionPaneProps) => {
  const { t } = useLingui();
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { resetRecordSelection } = useResetRecordSelection();
  const { targetAiChatThreadsInContextStore } =
    useTargetAiChatThreadsInContextStore();

  useEffect(() => {
    const selectedRecordIdSet = new Set(selectedRecordIds);

    targetAiChatThreadsInContextStore({
      contextStoreInstanceId: AI_CHAT_INBOX_INSTANCE_ID,
      threads: threads.filter(({ id }) => selectedRecordIdSet.has(id)),
    });
  }, [selectedRecordIds, threads, targetAiChatThreadsInContextStore]);

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: resetRecordSelection,
    containsModifier: false,
    dependencies: [resetRecordSelection],
  });

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: AI_CHAT_INBOX_INSTANCE_ID }}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: AI_CHAT_INBOX_INSTANCE_ID }}
      >
        <PageCardLayout
          header={
            <PageCardHeader
              actionButton={
                <CommandMenuContextProvider
                  displayType="button"
                  containerType={CommandMenuItemContainerType.ShowPageHeader}
                >
                  <PinnedCommandMenuItemButtons />
                </CommandMenuContextProvider>
              }
            />
          }
        >
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Title>
                {plural(selectedRecordIds.length, {
                  one: '# chat selected',
                  other: '# chats selected',
                })}
              </EmptyState.Title>
            </EmptyState.Content>
            <Button
              variant="outline"
              startIcon={<IconX />}
              onClick={resetRecordSelection}
            >
              {t`Clear selection`}
            </Button>
          </EmptyState.Root>
        </PageCardLayout>
      </CommandMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
