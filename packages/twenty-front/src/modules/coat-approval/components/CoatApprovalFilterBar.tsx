import {
  type CoatFilterValues,
  type CoatTab,
} from '@/coat-approval/types/coat-approval.types';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import {
  IconArrowDown,
  IconArrowUp,
  IconRefresh,
  IconSearch,
} from 'twenty-ui/display';

type CoatApprovalFilterBarProps = {
  filterValues: CoatFilterValues;
  onFilterChange: (values: CoatFilterValues) => void;
  activeTab: CoatTab;
  sortAscending: boolean;
  onToggleSort: () => void;
  onRefresh: () => void;
};

const StyledFilterContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFilterInput = styled.div`
  flex: 1 1 140px;
  min-width: 120px;
`;

const StyledSelect = styled.select`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 32px;
  outline: none;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledDateInput = styled.input`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 32px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledDateLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: 2px;
`;

export const CoatApprovalFilterBar = ({
  filterValues,
  onFilterChange,
  activeTab,
  sortAscending,
  onToggleSort,
  onRefresh,
}: CoatApprovalFilterBarProps) => {
  const updateFilter = (key: keyof CoatFilterValues, value: string) => {
    onFilterChange({ ...filterValues, [key]: value });
  };

  // Hide export status filter on "analyze" tab since that tab already filters by status
  const showExportStatusFilter = activeTab !== 'analyze';

  return (
    <StyledFilterContainer>
      <StyledFilterInput>
        <TextInput
          value={filterValues.searchTerm}
          onChange={(value) => updateFilter('searchTerm', value)}
          placeholder="Search contracts..."
          LeftIcon={IconSearch}
          fullWidth
          sizeVariant="sm"
        />
      </StyledFilterInput>
      {showExportStatusFilter && (
        <StyledFilterInput>
          <StyledSelect
            value={filterValues.exportStatus}
            onChange={(event) =>
              updateFilter('exportStatus', event.target.value)
            }
          >
            <option value="">All Statuses</option>
            <option value="NEEDS_APPROVAL">Needs Approval</option>
            <option value="READY_FOR_EXPORT">Ready for Export</option>
            <option value="EXPORTED">Exported</option>
            <option value="DECLINED">Declined</option>
          </StyledSelect>
        </StyledFilterInput>
      )}
      <StyledFilterInput>
        <StyledSelect
          value={filterValues.programName}
          onChange={(event) => updateFilter('programName', event.target.value)}
        >
          <option value="">All Products</option>
          <option value="Coaching">Coaching</option>
          <option value="Ausbildung">Ausbildung</option>
          <option value="Blueprint">Blueprint</option>
          <option value="Fundament">Fundament</option>
        </StyledSelect>
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledDateLabel>Signing date from</StyledDateLabel>
        <StyledDateInput
          type="date"
          value={filterValues.dateFrom}
          onChange={(event) => updateFilter('dateFrom', event.target.value)}
          title="Signing date from"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledDateLabel>Signing date to</StyledDateLabel>
        <StyledDateInput
          type="date"
          value={filterValues.dateTo}
          onChange={(event) => updateFilter('dateTo', event.target.value)}
          title="Signing date to"
        />
      </StyledFilterInput>
      <StyledIconButton
        onClick={onToggleSort}
        title={sortAscending ? 'Oldest first' : 'Newest first'}
      >
        {sortAscending ? (
          <IconArrowUp size={16} />
        ) : (
          <IconArrowDown size={16} />
        )}
      </StyledIconButton>
      <StyledIconButton onClick={onRefresh} title="Refresh data">
        <IconRefresh size={16} />
      </StyledIconButton>
    </StyledFilterContainer>
  );
};
