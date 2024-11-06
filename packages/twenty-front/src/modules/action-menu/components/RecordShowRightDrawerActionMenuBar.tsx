import { RecordShowActionMenuBarEntry } from '@/action-menu/components/RecordShowActionMenuBarEntry';
import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowRightDrawerActionMenuBar = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const standardActionMenuEntries = actionMenuEntries.filter(
    (actionMenuEntry) => actionMenuEntry.type === 'standard',
  );

  return (
    <>
      {standardActionMenuEntries.map((actionMenuEntry) => (
        <RecordShowActionMenuBarEntry entry={actionMenuEntry} />
      ))}
    </>
  );
};
