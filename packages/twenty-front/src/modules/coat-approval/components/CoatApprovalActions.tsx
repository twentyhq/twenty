import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { type CoatExportStatus } from '@/coat-approval/types/coat-approval.types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

type CoatApprovalActionsProps = {
  contractId: string;
  currentStatus: string | null;
};

const StyledActionsContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledButton = styled.button<{ variant: 'approve' | 'decline' | 'revert' }>`
  align-items: center;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  transition: opacity 0.15s ease;

  background: ${({ variant }) => {
    switch (variant) {
      case 'approve':
        return '#22c55e';
      case 'decline':
        return '#ef4444';
      case 'revert':
        return '#6b7280';
    }
  }};

  color: #ffffff;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledDeclineDialog = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledTextarea = styled.textarea`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  min-height: 80px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: vertical;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledDialogActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

export const CoatApprovalActions = ({
  contractId,
  currentStatus,
}: CoatApprovalActionsProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleStatusUpdate = useCallback(
    async (newStatus: CoatExportStatus) => {
      setIsUpdating(true);

      try {
        // TODO: Confirm the exact field name for export status on the tobContract object
        await updateOneRecord({
          objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
          idToUpdate: contractId,
          updateOneRecordInput: {
            status: newStatus,
          },
        });
      } finally {
        setIsUpdating(false);
        setShowDeclineDialog(false);
        setDeclineReason('');
      }
    },
    [contractId, updateOneRecord],
  );

  const handleApprove = useCallback(() => {
    handleStatusUpdate('READY_FOR_EXPORT');
  }, [handleStatusUpdate]);

  const handleDeclineConfirm = useCallback(() => {
    // TODO: Store the decline reason somewhere — possibly a separate field or note
    handleStatusUpdate('DECLINED');
  }, [handleStatusUpdate]);

  const handleRevert = useCallback(() => {
    handleStatusUpdate('NEEDS_APPROVAL');
  }, [handleStatusUpdate]);

  if (showDeclineDialog) {
    return (
      <StyledDeclineDialog>
        <StyledTextarea
          value={declineReason}
          onChange={(event) => setDeclineReason(event.target.value)}
          placeholder="Reason for declining..."
        />
        <StyledDialogActions>
          <StyledButton
            variant="revert"
            onClick={() => setShowDeclineDialog(false)}
            disabled={isUpdating}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="decline"
            onClick={handleDeclineConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? 'Declining...' : 'Confirm Decline'}
          </StyledButton>
        </StyledDialogActions>
      </StyledDeclineDialog>
    );
  }

  return (
    <StyledActionsContainer>
      {currentStatus !== 'READY_FOR_EXPORT' && (
        <StyledButton
          variant="approve"
          onClick={handleApprove}
          disabled={isUpdating}
        >
          {isUpdating ? 'Approving...' : 'Approve for Export'}
        </StyledButton>
      )}
      {currentStatus !== 'DECLINED' && (
        <StyledButton
          variant="decline"
          onClick={() => setShowDeclineDialog(true)}
          disabled={isUpdating}
        >
          Decline
        </StyledButton>
      )}
      {currentStatus !== 'NEEDS_APPROVAL' && (
        <StyledButton
          variant="revert"
          onClick={handleRevert}
          disabled={isUpdating}
        >
          {isUpdating ? 'Reverting...' : 'Revert to Needs Approval'}
        </StyledButton>
      )}
    </StyledActionsContainer>
  );
};
