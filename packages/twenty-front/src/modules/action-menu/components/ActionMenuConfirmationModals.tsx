import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const ActionMenuConfirmationModals = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

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
