import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { plural, t } from '@lingui/core/macro';

type SettingsAdminDeleteJobsConfirmationModalProps = {
  modalId: string;
  jobCount: number;
  onConfirm: () => void;
  onClose?: () => void;
};

export const SettingsAdminDeleteJobsConfirmationModal = ({
  modalId,
  jobCount,
  onConfirm,
  onClose,
}: SettingsAdminDeleteJobsConfirmationModalProps) => {
  const title = plural(jobCount, {
    one: `Delete ${jobCount} Job`,
    other: `Delete ${jobCount} Jobs`,
  });

  const subtitle = plural(jobCount, {
    one: `This will permanently remove it from the queue. This action cannot be undone.`,
    other: `This will permanently remove them from the queue. This action cannot be undone.`,
  });

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
