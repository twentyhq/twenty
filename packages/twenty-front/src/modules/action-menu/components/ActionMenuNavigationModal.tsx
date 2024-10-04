import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { useRecoilValue } from 'recoil';

export const ActionMenuNavigationModal = () => {
  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  return (
    <div data-select-disable>
      {actionMenuEntries.map((actionMenuEntry, index) =>
        actionMenuEntry.ConfirmationModal ? (
          <div key={index}>{actionMenuEntry.ConfirmationModal}</div>
        ) : null,
      )}
    </div>
  );
};
