import { CoachingLeftPanel } from '@/coaching/components/CoachingLeftPanel';
import { CoachingRightPanel } from '@/coaching/components/CoachingRightPanel';
import { useCoachingCustomersList } from '@/coaching/hooks/useCoachingCustomersList';
import { useCoachingObjectExists } from '@/coaching/hooks/useCoachingObjectExists';
import { type CoachingFilterValues } from '@/coaching/types/coaching.types';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { IconAlertTriangle } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';

type CoachingBodyProps = {
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
};

type CoachingBodyContentProps = CoachingBodyProps;

const INITIAL_FILTER_VALUES: CoachingFilterValues = {
  searchTerm: '',
};

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

const CoachingBodyContent = ({
  selectedCustomerId,
  onSelectCustomer,
}: CoachingBodyContentProps) => {
  const [filterValues, setFilterValues] =
    useState<CoachingFilterValues>(INITIAL_FILTER_VALUES);

  const [queryFilterValues, setQueryFilterValues] =
    useState<CoachingFilterValues>(INITIAL_FILTER_VALUES);

  const debouncedUpdate = useDebouncedCallback(
    (values: CoachingFilterValues) => {
      setQueryFilterValues(values);
    },
    300,
  );

  const handleFilterChange = useCallback(
    (values: CoachingFilterValues) => {
      setFilterValues(values);
      debouncedUpdate(values);
    },
    [debouncedUpdate],
  );

  const { customers, loading, fetchMoreRecords, hasNextPage } =
    useCoachingCustomersList(queryFilterValues);

  return (
    <StyledBodyContainer>
      <CoachingLeftPanel
        customers={customers}
        loading={loading}
        fetchMoreRecords={fetchMoreRecords}
        hasNextPage={hasNextPage}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={onSelectCustomer}
      />
      <CoachingRightPanel selectedCustomerId={selectedCustomerId} />
    </StyledBodyContainer>
  );
};

export const CoachingBody = ({
  selectedCustomerId,
  onSelectCustomer,
}: CoachingBodyProps) => {
  const { exists, isLoading } = useCoachingObjectExists();

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
        <StyledMessageTitle>Customer object not found</StyledMessageTitle>
        <StyledMessageText>
          The tobCustomer object has not been set up in this workspace. Please
          contact your administrator to create the tobCustomer object and sync
          customer data.
        </StyledMessageText>
      </StyledMessageContainer>
    );
  }

  return (
    <CoachingBodyContent
      selectedCustomerId={selectedCustomerId}
      onSelectCustomer={onSelectCustomer}
    />
  );
};
