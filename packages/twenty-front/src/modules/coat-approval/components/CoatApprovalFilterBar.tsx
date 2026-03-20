import { type CoatFilterValues } from '@/coat-approval/types/coat-approval.types';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { IconSearch } from 'twenty-ui/display';

type CoatApprovalFilterBarProps = {
  filterValues: CoatFilterValues;
  onFilterChange: (values: CoatFilterValues) => void;
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

export const CoatApprovalFilterBar = ({
  filterValues,
  onFilterChange,
}: CoatApprovalFilterBarProps) => {
  const updateFilter = (key: keyof CoatFilterValues, value: string) => {
    onFilterChange({ ...filterValues, [key]: value });
  };

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
      <StyledFilterInput>
        <StyledSelect
          value={filterValues.exportStatus}
          onChange={(event) => updateFilter('exportStatus', event.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NEEDS_APPROVAL">Needs Approval</option>
          <option value="READY_FOR_EXPORT">Ready for Export</option>
          <option value="DECLINED">Declined</option>
        </StyledSelect>
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledSelect
          value={filterValues.programName}
          onChange={(event) => updateFilter('programName', event.target.value)}
        >
          <option value="">All Products</option>
          <option value="Schmerzfrei">Schmerzfrei</option>
          <option value="Ausbildung">Ausbildung</option>
          <option value="Blueprint">Blueprint</option>
        </StyledSelect>
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledDateInput
          type="date"
          value={filterValues.dateFrom}
          onChange={(event) => updateFilter('dateFrom', event.target.value)}
          title="Signature date from"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledDateInput
          type="date"
          value={filterValues.dateTo}
          onChange={(event) => updateFilter('dateTo', event.target.value)}
          title="Signature date to"
        />
      </StyledFilterInput>
    </StyledFilterContainer>
  );
};
