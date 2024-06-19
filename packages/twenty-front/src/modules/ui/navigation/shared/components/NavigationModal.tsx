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
      {actionBarEntries[0]?.ConfirmationModal ?? null}
    </div>
  );
};

export default SharedNavigationModal;
