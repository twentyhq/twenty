import { CoatApprovalDetail } from '@/coat-approval/components/CoatApprovalDetail';
import { CoatApprovalEmptyDetail } from '@/coat-approval/components/CoatApprovalEmptyDetail';
import { useCoatContractDetail } from '@/coat-approval/hooks/useCoatContractDetail';
import { type CoatContractRecord } from '@/coat-approval/types/coat-approval.types';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type CoatApprovalRightPanelProps = {
  selectedContractId: string | null;
};

const StyledRightPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
`;

const StyledErrorContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const CoatApprovalRightPanel = ({
  selectedContractId,
}: CoatApprovalRightPanelProps) => {
  const { contract, loading, error } =
    useCoatContractDetail(selectedContractId);

  if (!isDefined(selectedContractId)) {
    return (
      <StyledRightPanel>
        <CoatApprovalEmptyDetail />
      </StyledRightPanel>
    );
  }

  if (loading) {
    return (
      <StyledRightPanel>
        <StyledLoadingContainer>
          Loading contract details...
        </StyledLoadingContainer>
      </StyledRightPanel>
    );
  }

  if (error) {
    return (
      <StyledRightPanel>
        <StyledErrorContainer>
          Failed to load contract details. Please try again.
        </StyledErrorContainer>
      </StyledRightPanel>
    );
  }

  if (!contract) {
    return (
      <StyledRightPanel>
        <CoatApprovalEmptyDetail />
      </StyledRightPanel>
    );
  }

  const contractRecord =
    contract as unknown as CoatContractRecord;

  return (
    <StyledRightPanel>
      <CoatApprovalDetail contract={contractRecord} />
    </StyledRightPanel>
  );
};
