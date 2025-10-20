import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type DeleteJobsConfirmationModalProps = {
  modalId: string;
  jobCount: number;
  onConfirm: () => void;
  onClose?: () => void;
};

export const DeleteJobsConfirmationModal = ({
  modalId,
  jobCount,
  onConfirm,
  onClose,
}: DeleteJobsConfirmationModalProps) => {
  const jobText = jobCount === 1 ? 'Job' : 'Jobs';
  const pronounText = jobCount === 1 ? 'it' : 'them';

  const title = t`Delete ${jobCount} ${jobText}`;
  const subtitle = t`This will permanently remove ${pronounText} from the queue. This action cannot be undone.`;

  return (
    <ConfirmationModal
      modalId={modalId}
      title={title}
      subtitle={subtitle}
      onConfirmClick={onConfirm}
      onClose={onClose}
      confirmButtonText={t`Delete`}
      confirmButtonAccent="danger"
    />
  );
};
