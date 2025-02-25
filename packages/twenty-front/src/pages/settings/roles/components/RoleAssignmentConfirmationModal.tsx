import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { RoleAssignmentConfirmationModalSubtitle } from '~/pages/settings/roles/components/RoleAssignmentConfirmationModalSubtitle';
import { RoleAssignmentConfirmationModalSelectedWorkspaceMember } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalSelectedWorkspaceMember';

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
      deleteButtonText={t`Confirm`}
      confirmButtonAccent="blue"
    />
  );
};
