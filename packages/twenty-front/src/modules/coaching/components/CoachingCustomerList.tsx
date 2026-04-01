import { CoachingCustomerListItem } from '@/coaching/components/CoachingCustomerListItem';
import { type CoachingCustomerRecord } from '@/coaching/types/coaching.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { useInView } from 'react-intersection-observer';

type CoachingCustomerListProps = {
  customers: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
};

const StyledListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
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

const StyledCountHeader = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
`;

export const CoachingCustomerList = ({
  customers,
  loading,
  fetchMoreRecords,
  hasNextPage,
  selectedCustomerId,
  onSelectCustomer,
}: CoachingCustomerListProps) => {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords?.();
      }
    },
  });

  if (loading && customers.length === 0) {
    return (
      <StyledListContainer>
        <StyledLoadingContainer>Loading customers...</StyledLoadingContainer>
      </StyledListContainer>
    );
  }

  if (customers.length === 0) {
    return (
      <StyledListContainer>
        <StyledEmptyContainer>No customers found</StyledEmptyContainer>
      </StyledListContainer>
    );
  }

  return (
    <StyledListContainer>
      <StyledCountHeader>Users ({customers.length})</StyledCountHeader>
      {customers.map((customer) => {
        const customerRecord =
          customer as unknown as CoachingCustomerRecord;

        return (
          <CoachingCustomerListItem
            key={customerRecord.id}
            name={customerRecord.displayName || customerRecord.name || ''}
            email={customerRecord.email}
            isSelected={customerRecord.id === selectedCustomerId}
            onClick={() => onSelectCustomer(customerRecord.id)}
          />
        );
      })}
      {hasNextPage && <StyledLoadMoreTrigger ref={ref} />}
      {loading && customers.length > 0 && (
        <StyledLoadingMore>Loading more...</StyledLoadingMore>
      )}
    </StyledListContainer>
  );
};
