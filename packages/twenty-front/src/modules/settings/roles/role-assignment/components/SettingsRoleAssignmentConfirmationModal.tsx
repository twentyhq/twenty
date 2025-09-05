import { SettingsRoleAssignmentConfirmationModalSubtitle } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModalSubtitle';
import { ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-assignment/constants/RoleAssignmentConfirmationModalId';
import { type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedRoleTarget';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type SettingsRoleAssignmentConfirmationModalProps = {
  selectedRoleTarget: SettingsRoleAssignmentConfirmationModalSelectedRoleTarget;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
  newRoleName: string;
};

export const SettingsRoleAssignmentConfirmationModal = ({
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
      modalId={ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID}
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
