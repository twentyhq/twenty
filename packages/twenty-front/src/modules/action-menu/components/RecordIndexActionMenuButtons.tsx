import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Button } from 'twenty-ui';

export const RecordIndexActionMenuButtons = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  if (contextStoreNumberOfSelectedRecords === 0) {
    return null;
  }

  return (
    <>
      {pinnedEntries.map((entry, index) => (
        <Button
          key={index}
          Icon={entry.Icon}
          size="small"
          variant="secondary"
          accent="default"
          title={entry.label}
          onClick={() => entry.onClick?.()}
          ariaLabel={entry.label}
        />
      ))}
    </>
  );
};
