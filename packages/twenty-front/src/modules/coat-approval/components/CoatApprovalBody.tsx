import { CoatApprovalLeftPanel } from '@/coat-approval/components/CoatApprovalLeftPanel';
import { CoatApprovalRightPanel } from '@/coat-approval/components/CoatApprovalRightPanel';
import { INITIAL_FILTER_VALUES } from '@/coat-approval/constants/InitialFilterValues.constants';
import { useCoatContractsList } from '@/coat-approval/hooks/useCoatContractsList';
import { useCoatObjectExists } from '@/coat-approval/hooks/useCoatObjectExists';
import { type CoatFilterValues } from '@/coat-approval/types/coat-approval.types';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { IconAlertTriangle } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';

type CoatApprovalBodyProps = {
  selectedContractId: string | null;
  onSelectContract: (contractId: string) => void;
};

type CoatApprovalBodyContentProps = CoatApprovalBodyProps;

const StyledBodyContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
`;

const StyledMessageContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledMessageIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledMessageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledMessageText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  max-width: 400px;
  text-align: center;
`;

// Inner component that calls the data hooks — only rendered when contract object exists
const CoatApprovalBodyContent = ({
  selectedContractId,
  onSelectContract,
}: CoatApprovalBodyContentProps) => {
  const [filterValues, setFilterValues] = useState<CoatFilterValues>(
    INITIAL_FILTER_VALUES,
  );

  const [queryFilterValues, setQueryFilterValues] =
    useState<CoatFilterValues>(INITIAL_FILTER_VALUES);

  const debouncedUpdate = useDebouncedCallback(
    (values: CoatFilterValues) => {
      setQueryFilterValues(values);
    },
    300,
  );

  const handleFilterChange = useCallback(
    (values: CoatFilterValues) => {
      setFilterValues(values);
      debouncedUpdate(values);
    },
    [debouncedUpdate],
  );

  const { contracts, loading, fetchMoreRecords, hasNextPage } =
    useCoatContractsList(queryFilterValues);

  return (
    <StyledBodyContainer>
      <CoatApprovalLeftPanel
        contracts={contracts}
        loading={loading}
        fetchMoreRecords={fetchMoreRecords}
        hasNextPage={hasNextPage}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        selectedContractId={selectedContractId}
        onSelectContract={onSelectContract}
      />
      <CoatApprovalRightPanel selectedContractId={selectedContractId} />
    </StyledBodyContainer>
  );
};

// Gate component — checks if contract object exists before rendering content
export const CoatApprovalBody = ({
  selectedContractId,
  onSelectContract,
}: CoatApprovalBodyProps) => {
  const { exists, isLoading } = useCoatObjectExists();

  if (isLoading) {
    return (
      <StyledMessageContainer>
        <StyledMessageText>Loading...</StyledMessageText>
      </StyledMessageContainer>
    );
  }

  if (!exists) {
    return (
      <StyledMessageContainer>
        <StyledMessageIcon>
          <IconAlertTriangle size={48} />
        </StyledMessageIcon>
        <StyledMessageTitle>Contract object not found</StyledMessageTitle>
        <StyledMessageText>
          The tobContract object has not been set up in this workspace. Please
          contact your administrator to create the tobContract object and sync
          contract data.
        </StyledMessageText>
      </StyledMessageContainer>
    );
  }

  return (
    <CoatApprovalBodyContent
      selectedContractId={selectedContractId}
      onSelectContract={onSelectContract}
    />
  );
};
