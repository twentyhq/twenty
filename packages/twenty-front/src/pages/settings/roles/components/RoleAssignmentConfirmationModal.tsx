import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { RoleAssignmentConfirmationModalSubtitle } from '~/pages/settings/roles/components/RoleAssignmentConfirmationModalSubtitle';
import { RoleAssignmentConfirmationModalMode } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalMode';
import { RoleAssignmentConfirmationModalSelectedWorkspaceMember } from '~/pages/settings/roles/types/RoleAssignmentConfirmationModalSelectedWorkspaceMember';

type RoleAssignmentConfirmationModalProps = {
  mode: RoleAssignmentConfirmationModalMode;
  selectedWorkspaceMember: RoleAssignmentConfirmationModalSelectedWorkspaceMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
};

export const RoleAssignmentConfirmationModal = ({
  mode,
  selectedWorkspaceMember,
  isOpen,
  onClose,
  onConfirm,
  onRoleClick,
}: RoleAssignmentConfirmationModalProps) => {
  const isAssignMode = mode === 'assign';
  const hasExistingRole = !!selectedWorkspaceMember.role;

  const workspaceMemberName = selectedWorkspaceMember.name;

  const title = isAssignMode
    ? t`Assign ${workspaceMemberName}?`
    : t`Remove ${workspaceMemberName}?`;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={title}
      subtitle={
        <RoleAssignmentConfirmationModalSubtitle
          mode={mode}
          selectedWorkspaceMember={selectedWorkspaceMember}
          onRoleClick={onRoleClick}
        />
      }
      onConfirmClick={onConfirm}
      deleteButtonText={isAssignMode ? t`Confirm` : t`Remove`}
      confirmButtonAccent={isAssignMode && !hasExistingRole ? 'blue' : 'danger'}
    />
  );
};
