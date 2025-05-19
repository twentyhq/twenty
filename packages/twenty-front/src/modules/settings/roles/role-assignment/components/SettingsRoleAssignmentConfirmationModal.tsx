import { SettingsRoleAssignmentConfirmationModalSubtitle } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModalSubtitle';
import { ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-assignment/constants/RoleAssignmentConfirmationModalId';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type SettingsRoleAssignmentConfirmationModalProps = {
  selectedWorkspaceMember: SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
};

export const SettingsRoleAssignmentConfirmationModal = ({
  selectedWorkspaceMember,
  onClose,
  onConfirm,
  onRoleClick,
}: SettingsRoleAssignmentConfirmationModalProps) => {
  const workspaceMemberName = selectedWorkspaceMember.name;

  const title = t`Assign ${workspaceMemberName}?`;

  return (
    <ConfirmationModal
      modalId={ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID}
      title={title}
      subtitle={
        <SettingsRoleAssignmentConfirmationModalSubtitle
          selectedWorkspaceMember={selectedWorkspaceMember}
          onRoleClick={onRoleClick}
        />
      }
      onClose={onClose}
      onConfirmClick={onConfirm}
      confirmButtonText={t`Confirm`}
      confirmButtonAccent="danger"
    />
  );
};
