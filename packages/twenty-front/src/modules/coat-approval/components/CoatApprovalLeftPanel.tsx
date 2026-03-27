import { CoatApprovalFilterBar } from '@/coat-approval/components/CoatApprovalFilterBar';
import { CoatApprovalList } from '@/coat-approval/components/CoatApprovalList';
import { CoatApprovalTabBar } from '@/coat-approval/components/CoatApprovalTabBar';
import { type CoatTabCounts } from '@/coat-approval/hooks/useCoatTabCounts';
import {
  type CoatFilterValues,
  type CoatTab,
} from '@/coat-approval/types/coat-approval.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';

type CoatApprovalLeftPanelProps = {
  contracts: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  filterValues: CoatFilterValues;
  onFilterChange: (values: CoatFilterValues) => void;
  activeTab: CoatTab;
  onTabChange: (tab: CoatTab) => void;
  tabCounts: CoatTabCounts;
  sortAscending: boolean;
  onToggleSort: () => void;
  onRefresh: () => void;
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
  activeTab,
  onTabChange,
  tabCounts,
  sortAscending,
  onToggleSort,
  onRefresh,
  selectedContractId,
  onSelectContract,
}: CoatApprovalLeftPanelProps) => {
  return (
    <StyledLeftPanel>
      <CoatApprovalTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabCounts={tabCounts}
      />
      <CoatApprovalFilterBar
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        activeTab={activeTab}
        sortAscending={sortAscending}
        onToggleSort={onToggleSort}
        onRefresh={onRefresh}
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
