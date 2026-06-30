import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { plural, t } from '@lingui/core/macro';

type SettingsAdminRetryJobsConfirmationModalProps = {
  modalInstanceId: string;
  jobCount: number;
  onConfirm: () => void;
  onClose?: () => void;
};

export const SettingsAdminRetryJobsConfirmationModal = ({
  modalInstanceId,
  jobCount,
  onConfirm,
  onClose,
}: SettingsAdminRetryJobsConfirmationModalProps) => {
  const title = plural(jobCount, {
    one: `Retry ${jobCount} Job`,
    other: `Retry ${jobCount} Jobs`,
  });

  const subtitle = plural(jobCount, {
    one: `This will retry the selected job. It will be re-executed from the beginning.`,
    other: `This will retry the selected jobs. They will be re-executed from the beginning.`,
  });

  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={title}
      subtitle={subtitle}
      onConfirmClick={onConfirm}
      onClose={onClose}
      confirmButtonText={t`Retry`}
      confirmButtonAccent="blue"
    />
  );
};
