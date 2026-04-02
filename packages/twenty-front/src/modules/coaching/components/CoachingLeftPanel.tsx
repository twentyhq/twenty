import { CoachingCustomerList } from '@/coaching/components/CoachingCustomerList';
import { type CoachingFilterValues } from '@/coaching/types/coaching.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { IconFilter } from 'twenty-ui/display';

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
  color: #e74c3c;
  display: flex;
`;

const StyledFiltersTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledRemoveFiltersButton = styled.button`
  align-items: center;
  background: #f39c12;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: white;
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  width: 100%;

  &:hover {
    background: #e67e22;
  }
`;

const StyledFilterLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
`;

const StyledFilterInput = styled.input`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  outline: none;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;


const INITIAL_FILTER: CoachingFilterValues = { searchTerm: '' };

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
  const hasActiveFilters = filterValues.searchTerm !== '';

  return (
    <StyledLeftPanel>
      <StyledFiltersContainer>
        <StyledFiltersHeader>
          <StyledFiltersIcon>
            <IconFilter size={16} />
          </StyledFiltersIcon>
          <StyledFiltersTitle>Filter</StyledFiltersTitle>
        </StyledFiltersHeader>

        {hasActiveFilters && (
          <StyledRemoveFiltersButton
            onClick={() => onFilterChange(INITIAL_FILTER)}
          >
            <IconFilter size={14} />
            Filter entfernen
          </StyledRemoveFiltersButton>
        )}

        <StyledFilterLabel>Stichwort</StyledFilterLabel>
        <StyledFilterInput
          placeholder="Stichwort"
          value={filterValues.searchTerm}
          onChange={(event) =>
            onFilterChange({
              ...filterValues,
              searchTerm: event.target.value,
            })
          }
        />

        <StyledFilterLabel>Vollständiger Name</StyledFilterLabel>
        <StyledFilterInput
          placeholder="Suchen..."
          value={filterValues.searchTerm}
          onChange={(event) =>
            onFilterChange({
              ...filterValues,
              searchTerm: event.target.value,
            })
          }
        />
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
