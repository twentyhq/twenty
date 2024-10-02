import { ActionMenuEntry } from '@/ui/navigation/action-menu/types/ActionMenuEntry';

type NavigationModalProps = {
  actionMenuEntries: ActionMenuEntry[];
};

export const NavigationModal = ({
  actionMenuEntries,
}: NavigationModalProps) => {
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
