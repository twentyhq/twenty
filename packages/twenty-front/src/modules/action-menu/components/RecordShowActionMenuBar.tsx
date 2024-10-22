import { RecordShowActionMenuBarEntry } from '@/action-menu/components/RecordShowActionMenuBarEntry';
import { contextStoreActionMenuEntriesComponentSelector } from '@/context-store/states/contextStoreActionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowActionMenuBar = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    contextStoreActionMenuEntriesComponentSelector,
  );
  return (
    <>
      {actionMenuEntries.map((actionMenuEntry) => (
        <RecordShowActionMenuBarEntry entry={actionMenuEntry} />
      ))}
    </>
  );
};
