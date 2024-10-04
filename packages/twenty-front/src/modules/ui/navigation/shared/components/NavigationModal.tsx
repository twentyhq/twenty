import { ActionBarEntry } from '@/ui/navigation/action-bar/types/ActionBarEntry';

type SharedNavigationModalProps = {
  actionBarEntries: ActionBarEntry[];
  customClassName: string;
};

const SharedNavigationModal = ({
  actionBarEntries,
  customClassName,
}: SharedNavigationModalProps) => {
  return (
    <div data-select-disable className={customClassName}>
      {actionBarEntries.map((actionBarEntry, index) =>
        actionBarEntry.ConfirmationModal ? (
          <div key={index}>{actionBarEntry.ConfirmationModal}</div>
        ) : null,
      )}
    </div>
  );
};

export default SharedNavigationModal;
