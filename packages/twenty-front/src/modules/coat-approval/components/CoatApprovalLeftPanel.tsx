import { CoatApprovalFilterBar } from '@/coat-approval/components/CoatApprovalFilterBar';
import { CoatApprovalList } from '@/coat-approval/components/CoatApprovalList';
import { type CoatFilterValues } from '@/coat-approval/types/coat-approval.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';

type CoatApprovalLeftPanelProps = {
  contracts: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  filterValues: CoatFilterValues;
  onFilterChange: (values: CoatFilterValues) => void;
  selectedContractId: string | null;
  onSelectContract: (contractId: string) => void;
};

const StyledLeftPanel = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 340px;
  overflow: hidden;
  width: 380px;
`;

export const CoatApprovalLeftPanel = ({
  contracts,
  loading,
  fetchMoreRecords,
  hasNextPage,
  filterValues,
  onFilterChange,
  selectedContractId,
  onSelectContract,
}: CoatApprovalLeftPanelProps) => {
  return (
    <StyledLeftPanel>
      <CoatApprovalFilterBar
        filterValues={filterValues}
        onFilterChange={onFilterChange}
      />
      <CoatApprovalList
        contracts={contracts}
        loading={loading}
        fetchMoreRecords={fetchMoreRecords}
        hasNextPage={hasNextPage}
        selectedContractId={selectedContractId}
        onSelectContract={onSelectContract}
      />
    </StyledLeftPanel>
  );
};
