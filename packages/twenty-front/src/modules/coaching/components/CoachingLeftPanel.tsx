import { CoachingCustomerList } from '@/coaching/components/CoachingCustomerList';
import { type CoachingFilterValues } from '@/coaching/types/coaching.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { IconFilter, IconSearch } from 'twenty-ui/display';

type CoachingLeftPanelProps = {
  customers: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  filterValues: CoachingFilterValues;
  onFilterChange: (values: CoachingFilterValues) => void;
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
};

const StyledLeftPanel = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 280px;
  overflow: hidden;
  width: 320px;
`;

const StyledFiltersContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFiltersHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFiltersIcon = styled.div`
  color: ${({ theme }) => theme.color.red};
  display: flex;
`;

const StyledFiltersTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledFilterLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
`;

const StyledSearchInputWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledSearchIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-shrink: 0;
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const CoachingLeftPanel = ({
  customers,
  loading,
  fetchMoreRecords,
  hasNextPage,
  filterValues,
  onFilterChange,
  selectedCustomerId,
  onSelectCustomer,
}: CoachingLeftPanelProps) => {
  return (
    <StyledLeftPanel>
      <StyledFiltersContainer>
        <StyledFiltersHeader>
          <StyledFiltersIcon>
            <IconFilter size={16} />
          </StyledFiltersIcon>
          <StyledFiltersTitle>Filters</StyledFiltersTitle>
        </StyledFiltersHeader>
        <StyledFilterLabel>Keyword</StyledFilterLabel>
        <StyledSearchInputWrapper>
          <StyledSearchIcon>
            <IconSearch size={16} />
          </StyledSearchIcon>
          <StyledSearchInput
            placeholder="Search..."
            value={filterValues.searchTerm}
            onChange={(event) =>
              onFilterChange({
                ...filterValues,
                searchTerm: event.target.value,
              })
            }
          />
        </StyledSearchInputWrapper>
        <StyledFilterLabel>Full Name</StyledFilterLabel>
        <StyledSearchInputWrapper>
          <StyledSearchInput
            placeholder="Search..."
            value={filterValues.searchTerm}
            onChange={(event) =>
              onFilterChange({
                ...filterValues,
                searchTerm: event.target.value,
              })
            }
          />
        </StyledSearchInputWrapper>
      </StyledFiltersContainer>
      <CoachingCustomerList
        customers={customers}
        loading={loading}
        fetchMoreRecords={fetchMoreRecords}
        hasNextPage={hasNextPage}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={onSelectCustomer}
      />
    </StyledLeftPanel>
  );
};
