import { RoleAssignmentConfirmationModalSubtitle } from '@/settings/roles/role-assignment/components/RoleAssignmentConfirmationModalSubtitle';
import { RoleAssignmentConfirmationModalSelectedWorkspaceMember } from '@/settings/roles/role-assignment/types/RoleAssignmentConfirmationModalSelectedWorkspaceMember';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';

type RoleAssignmentConfirmationModalProps = {
  selectedWorkspaceMember: RoleAssignmentConfirmationModalSelectedWorkspaceMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
};

export const RoleAssignmentConfirmationModal = ({
  selectedWorkspaceMember,
  isOpen,
  onClose,
  onConfirm,
  onRoleClick,
}: RoleAssignmentConfirmationModalProps) => {
  const workspaceMemberName = selectedWorkspaceMember.name;

  const title = t`Assign ${workspaceMemberName}?`;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={title}
      subtitle={
        <RoleAssignmentConfirmationModalSubtitle
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
