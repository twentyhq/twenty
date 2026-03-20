import { CoatApprovalListItem } from '@/coat-approval/components/CoatApprovalListItem';
import { type CoatContractRecord } from '@/coat-approval/types/coat-approval.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { useInView } from 'react-intersection-observer';

type CoatApprovalListProps = {
  contracts: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  selectedContractId: string | null;
  onSelectContract: (contractId: string) => void;
};

const StyledListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledEmptyContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledLoadMoreTrigger = styled.div`
  height: 1px;
`;

const StyledLoadingMore = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

export const CoatApprovalList = ({
  contracts,
  loading,
  fetchMoreRecords,
  hasNextPage,
  selectedContractId,
  onSelectContract,
}: CoatApprovalListProps) => {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords?.();
      }
    },
  });

  if (loading && contracts.length === 0) {
    return (
      <StyledListContainer>
        <StyledLoadingContainer>
          Loading contracts...
        </StyledLoadingContainer>
      </StyledListContainer>
    );
  }

  if (contracts.length === 0) {
    return (
      <StyledListContainer>
        <StyledEmptyContainer>No contracts found</StyledEmptyContainer>
      </StyledListContainer>
    );
  }

  return (
    <StyledListContainer>
      {contracts.map((contract) => {
        const contractRecord =
          contract as unknown as CoatContractRecord;

        return (
          <CoatApprovalListItem
            key={contractRecord.id}
            contractName={contractRecord.name}
            customerName={contractRecord.customerName}
            programName={contractRecord.programName}
            status={contractRecord.status}
            signatureDate={contractRecord.signatureDate}
            isSelected={contractRecord.id === selectedContractId}
            onClick={() => onSelectContract(contractRecord.id)}
          />
        );
      })}
      {hasNextPage && <StyledLoadMoreTrigger ref={ref} />}
      {loading && contracts.length > 0 && (
        <StyledLoadingMore>Loading more...</StyledLoadingMore>
      )}
    </StyledListContainer>
  );
};
