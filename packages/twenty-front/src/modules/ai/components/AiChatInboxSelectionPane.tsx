import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordSelectionToContextStoreEffect } from '@/object-record/record-selection/components/RecordSelectionToContextStoreEffect';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AiChatInboxSelectionPane = () => {
  const { t } = useLingui();
  const numberOfSelectedThreads = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  ).length;
  const { resetRecordSelection } = useResetRecordSelection();

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: resetRecordSelection,
    containsModifier: false,
    dependencies: [resetRecordSelection],
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
      <RecordSelectionToContextStoreEffect />
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
          onClick={resetRecordSelection}
        >
          {t`Clear selection`}
        </Button>
      </EmptyState.Root>
    </PageCardLayout>
  );
};
