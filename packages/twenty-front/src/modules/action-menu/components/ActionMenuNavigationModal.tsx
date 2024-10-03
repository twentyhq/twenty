import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';

type ActionMenuNavigationModalProps = {
  actionMenuEntries: ActionMenuEntry[];
};

export const ActionMenuNavigationModal = ({
  actionMenuEntries,
}: ActionMenuNavigationModalProps) => {
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
