import { SettingsRoleAssignmentConfirmationModalSubtitle } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModalSubtitle';
import { type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedRoleTarget';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type SettingsRoleAssignmentConfirmationModalProps = {
  modalInstanceId: string;
  selectedRoleTarget: SettingsRoleAssignmentConfirmationModalSelectedRoleTarget;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
  newRoleName: string;
};

export const SettingsRoleAssignmentConfirmationModal = ({
  modalInstanceId,
  selectedRoleTarget,
  onClose,
  onConfirm,
  onRoleClick,
  newRoleName,
}: SettingsRoleAssignmentConfirmationModalProps) => {
  const roleTargetName = selectedRoleTarget.name;

  const title = t`Assign ${roleTargetName}?`;

  return (
    <ConfirmationModal
      modalInstanceId={modalInstanceId}
      title={title}
      subtitle={
        selectedRoleTarget.role ? (
          <SettingsRoleAssignmentConfirmationModalSubtitle
            selectedRoleTarget={selectedRoleTarget}
            onRoleClick={onRoleClick}
          />
        ) : (
          t`${roleTargetName} will be assigned to the "${newRoleName}" role.`
        )
      }
      onClose={onClose}
      onConfirmClick={onConfirm}
      confirmButtonText={t`Confirm`}
      confirmButtonAccent="danger"
    />
  );
};
