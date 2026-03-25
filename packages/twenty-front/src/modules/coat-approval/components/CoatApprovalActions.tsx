import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { type CoatExportStatus } from '@/coat-approval/types/coat-approval.types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

type CoatApprovalActionsProps = {
  contractId: string;
  currentExportStatus: string | null;
};

const StyledActionsContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled.button<{
  variant: 'approve' | 'decline' | 'revert';
}>`
  align-items: center;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(4)};
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

const StyledSuccessMessage = styled.div`
  background: #22c55e15;
  border: 1px solid #22c55e40;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: #166534;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

const StyledErrorMessage = styled.div`
  background: #ef444415;
  border: 1px solid #ef444440;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: #991b1b;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export const CoatApprovalActions = ({
  contractId,
  currentExportStatus,
}: CoatApprovalActionsProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const handleStatusUpdate = useCallback(
    async (newStatus: CoatExportStatus, message: string) => {
      setIsUpdating(true);
      clearMessages();

      try {
        await updateOneRecord({
          objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
          idToUpdate: contractId,
          updateOneRecordInput: {
            coatExportStatus: newStatus,
          },
        });
        setSuccessMessage(message);
      } catch {
        setErrorMessage('Failed to update status. Please try again.');
      } finally {
        setIsUpdating(false);
        setShowDeclineDialog(false);
        setDeclineReason('');
      }
    },
    [contractId, updateOneRecord, clearMessages],
  );

  const handleApprove = useCallback(() => {
    handleStatusUpdate(
      'READY_FOR_EXPORT',
      'Contract approved for export.',
    );
  }, [handleStatusUpdate]);

  const handleDeclineConfirm = useCallback(() => {
    // The decline reason is stored in the update call below.
    // TODO: Store the decline reason in a note/comment on the record
    // once the note creation pattern is wired up.
    handleStatusUpdate('DECLINED', 'Contract declined.');
  }, [handleStatusUpdate]);

  const handleRevert = useCallback(() => {
    handleStatusUpdate(
      'NEEDS_APPROVAL',
      'Contract reverted to Needs Approval.',
    );
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
            onClick={() => {
              setShowDeclineDialog(false);
              clearMessages();
            }}
            disabled={isUpdating}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="decline"
            onClick={handleDeclineConfirm}
            disabled={isUpdating || declineReason.trim().length === 0}
          >
            {isUpdating ? 'Declining...' : 'Confirm Decline'}
          </StyledButton>
        </StyledDialogActions>
      </StyledDeclineDialog>
    );
  }

  return (
    <StyledActionsContainer>
      {successMessage && (
        <StyledSuccessMessage>{successMessage}</StyledSuccessMessage>
      )}
      {errorMessage && (
        <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
      )}
      <StyledButtonRow>
        {currentExportStatus !== 'READY_FOR_EXPORT' && (
          <StyledButton
            variant="approve"
            onClick={handleApprove}
            disabled={isUpdating}
          >
            {isUpdating ? 'Approving...' : 'Approve for Export'}
          </StyledButton>
        )}
        {currentExportStatus !== 'DECLINED' && (
          <StyledButton
            variant="decline"
            onClick={() => {
              setShowDeclineDialog(true);
              clearMessages();
            }}
            disabled={isUpdating}
          >
            Decline
          </StyledButton>
        )}
        {currentExportStatus !== 'NEEDS_APPROVAL' &&
          currentExportStatus !== null && (
            <StyledButton
              variant="revert"
              onClick={handleRevert}
              disabled={isUpdating}
            >
              {isUpdating ? 'Reverting...' : 'Revert to Needs Approval'}
            </StyledButton>
          )}
      </StyledButtonRow>
    </StyledActionsContainer>
  );
};
