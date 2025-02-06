import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconChevronRight, IconUser } from 'twenty-ui';

const StyledRoleButton = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0, 4)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledLeftContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledChevronIcon = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 14px;
  width: 14px;
`;

export type ModalMode = 'assign' | 'remove';

export type SelectedWorkspaceMember = {
  id: string;
  name: string;
  role?: { id: string; label: string };
};

type RoleAssignmentModalProps = {
  mode: ModalMode;
  selectedWorkspaceMember: SelectedWorkspaceMember;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRoleClick: (roleId: string) => void;
};

export const RoleAssignmentModal = ({
  mode,
  selectedWorkspaceMember,
  isOpen,
  onClose,
  onConfirm,
  onRoleClick,
}: RoleAssignmentModalProps) => {
  const isAssignMode = mode === 'assign';
  const hasExistingRole = Boolean(selectedWorkspaceMember.role);

  const selectedWorkspaceMemberName = selectedWorkspaceMember.name;

  const renderSubtitle = () => {
    if (isAssignMode && hasExistingRole) {
      return (
        <>
          {t`${selectedWorkspaceMemberName} will be unassigned from the following role:`}
          <StyledRoleButton
            onClick={() => onRoleClick(selectedWorkspaceMember.role?.id ?? '')}
          >
            <StyledLeftContent>
              <IconUser size={14} />
              {selectedWorkspaceMember.role?.label}
            </StyledLeftContent>
            <StyledChevronIcon />
          </StyledRoleButton>
        </>
      );
    }

    return isAssignMode
      ? t`Are you sure you want to assign this role?`
      : t`This member will be unassigned from this role.`;
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={
        isAssignMode
          ? t`Assign ${selectedWorkspaceMemberName}?`
          : t`Remove ${selectedWorkspaceMemberName}?`
      }
      subtitle={renderSubtitle()}
      onConfirmClick={onConfirm}
      deleteButtonText={isAssignMode ? t`Confirm` : t`Remove`}
      confirmButtonAccent={'danger'}
    />
  );
};
