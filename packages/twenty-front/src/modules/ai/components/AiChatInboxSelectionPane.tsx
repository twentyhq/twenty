import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID } from '@/ai/constants/AiChatInboxRecordSelectionInstanceId';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordSelectionToContextStoreEffect } from '@/object-record/record-selection/components/RecordSelectionToContextStoreEffect';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

type AiChatInboxSelectionPaneProps = {
  numberOfSelectedThreads: number;
  onClearSelection: () => void;
};

export const AiChatInboxSelectionPane = ({
  numberOfSelectedThreads,
  onClearSelection,
}: AiChatInboxSelectionPaneProps) => {
  const { t } = useLingui();

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: onClearSelection,
    containsModifier: false,
    dependencies: [onClearSelection],
  });

  return (
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
      <RecordSelectionComponentInstanceContext.Provider
        value={{ instanceId: AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID }}
      >
        <RecordSelectionToContextStoreEffect />
      </RecordSelectionComponentInstanceContext.Provider>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Title>
            {plural(numberOfSelectedThreads, {
              one: '# chat selected',
              other: '# chats selected',
            })}
          </EmptyState.Title>
        </EmptyState.Content>
        <Button
          variant="outline"
          startIcon={<IconX />}
          onClick={onClearSelection}
        >
          {t`Clear selection`}
        </Button>
      </EmptyState.Root>
    </PageCardLayout>
  );
};
