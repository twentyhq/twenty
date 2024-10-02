import { ActionMenuEntry } from '@/ui/navigation/action-menu/types/ActionMenuEntry';

type NavigationModalProps = {
  actionMenuEntries: ActionMenuEntry[];
  customClassName: string;
};

export const NavigationModal = ({
  actionMenuEntries,
  customClassName,
}: NavigationModalProps) => {
  return (
    <div data-select-disable className={customClassName}>
      {actionMenuEntries.map((actionMenuEntry, index) =>
        actionMenuEntry.ConfirmationModal ? (
          <div key={index}>{actionMenuEntry.ConfirmationModal}</div>
        ) : null,
      )}
    </div>
  );
};
