import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type RetryJobsConfirmationModalProps = {
  modalId: string;
  jobCount: number;
  onConfirm: () => void;
  onClose?: () => void;
};

export const RetryJobsConfirmationModal = ({
  modalId,
  jobCount,
  onConfirm,
  onClose,
}: RetryJobsConfirmationModalProps) => {
  const jobText = jobCount === 1 ? 'Job' : 'Jobs';
  const pronounText = jobCount === 1 ? 'It' : 'They';
  const jobTypeText = jobCount === 1 ? 'job' : 'jobs';

  const title = t`Retry ${jobCount} ${jobText}`;

  const subtitle = t`This will retry the selected ${jobTypeText}. ${pronounText} will be re-executed from the beginning.`;

  return (
    <ConfirmationModal
      modalId={modalId}
      title={title}
      subtitle={subtitle}
      onConfirmClick={onConfirm}
      onClose={onClose}
      confirmButtonText={t`Retry`}
      confirmButtonAccent="blue"
    />
  );
};
