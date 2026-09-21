import { getRecordGroupReorderConfirmationModalId } from '@/object-record/record-group/utils/getRecordGroupReorderConfirmationModalId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type RecordGroupReorderConfirmationModalProps = {
  onConfirmClick: () => void;
};

export const RecordGroupReorderConfirmationModal = ({
  onConfirmClick,
}: RecordGroupReorderConfirmationModalProps): ReactNode => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const recordIndexRecordGroupSort = useAtomComponentStateValue(
    recordIndexRecordGroupSortComponentState,
  );

  return (
    <>
      {createPortal(
        <ConfirmationDialog
          dialogId={getRecordGroupReorderConfirmationModalId(recordIndexId)}
          title={t`Group sorting`}
          subtitle={t`Would you like to remove ${recordIndexRecordGroupSort} group sorting?`}
          onConfirmClick={onConfirmClick}
          confirmButtonText={t`Remove`}
        />,
        document.body,
      )}
    </>
  );
};
