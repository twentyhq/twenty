import { RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID } from '@/object-record/record-group/constants/RecordGroupReorderConfirmationModalId';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { createPortal } from 'react-dom';

type RecordGroupReorderConfirmationModalProps = {
  onConfirmClick: () => void;
};

export const RecordGroupReorderConfirmationModal = ({
  onConfirmClick,
}: RecordGroupReorderConfirmationModalProps) => {
  const recordGroupSort = useRecoilComponentValue(
    recordIndexRecordGroupSortComponentState,
  );

  return createPortal(
    <ConfirmationModal
      modalId={RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID}
      title="Group sorting"
      subtitle={`Would you like to remove ${recordGroupSort} group sorting?`}
      onConfirmClick={onConfirmClick}
      confirmButtonText="Remove"
    />,
    document.body,
  );
};
