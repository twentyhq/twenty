import { RecordShowActionMenuBarEntry } from '@/action-menu/components/RecordShowActionMenuBarEntry';
import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowActionMenuBar = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );
  return (
    <>
      {actionMenuEntries.map((actionMenuEntry) => (
        <RecordShowActionMenuBarEntry entry={actionMenuEntry} />
      ))}
    </>
  );
};
