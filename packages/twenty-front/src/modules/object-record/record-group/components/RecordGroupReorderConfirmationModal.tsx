import { isRecordGroupReorderConfirmationModalVisibleState } from '@/object-record/record-group/states/isRecordGroupReorderConfirmationModalVisibleState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';

type RecordGroupReorderConfirmationModalProps = {
  onConfirmClick: () => void;
};

export const RecordGroupReorderConfirmationModal = ({
  onConfirmClick,
}: RecordGroupReorderConfirmationModalProps) => {
  const [
    isRecordGroupReorderConfirmationModalVisible,
    setIsRecordGroupReorderConfirmationModalVisible,
  ] = useRecoilState(isRecordGroupReorderConfirmationModalVisibleState);

  const recordGroupSort = useRecoilComponentValueV2(
    recordIndexRecordGroupSortComponentState,
  );

  if (!isRecordGroupReorderConfirmationModalVisible) {
    return null;
  }

  return createPortal(
    <ConfirmationModal
      isOpen={isRecordGroupReorderConfirmationModalVisible}
      setIsOpen={setIsRecordGroupReorderConfirmationModalVisible}
      title="Group sorting"
      subtitle={`Would you like to remove ${recordGroupSort} group sorting ?`}
      onConfirmClick={onConfirmClick}
      deleteButtonText="Remove"
    />,
    document.body,
  );
};
