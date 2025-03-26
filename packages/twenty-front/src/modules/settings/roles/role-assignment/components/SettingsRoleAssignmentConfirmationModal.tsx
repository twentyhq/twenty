import { SettingsRoleAssignmentConfirmationModalSubtitle } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModalSubtitle';
import { SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type SettingsRoleAssignmentConfirmationModalProps = {
  selectedWorkspaceMember: SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
};

export const SettingsRoleAssignmentConfirmationModal = ({
  selectedWorkspaceMember,
  isOpen,
  onClose,
  onConfirm,
  onRoleClick,
}: SettingsRoleAssignmentConfirmationModalProps) => {
  const workspaceMemberName = selectedWorkspaceMember.name;

  const title = t`Assign ${workspaceMemberName}?`;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={title}
      subtitle={
        <SettingsRoleAssignmentConfirmationModalSubtitle
          selectedWorkspaceMember={selectedWorkspaceMember}
          onRoleClick={onRoleClick}
        />
      }
      onConfirmClick={onConfirm}
      confirmButtonText={t`Confirm`}
      confirmButtonAccent="danger"
    />
  );
};
