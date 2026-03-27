import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const TICKET_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  ticketId: true,
  title: true,
  status: true,
  priority: true,
  customerId: true,
  content: true,
  responseCount: true,
  ticketCreatedAt: true,
  resolvedAt: true,
};

export const useCoachingTickets = (customerId: string | null) => {
  const { records, loading } = useFindManyRecords({
    objectNameSingular: 'tobSupportTicket',
    filter: customerId ? { customerId: { eq: customerId } } : undefined,
    orderBy: [{ ticketCreatedAt: 'DescNullsLast' }],
    recordGqlFields: TICKET_GQL_FIELDS,
    limit: 100,
    skip: !customerId,
  });

  return { tickets: records, loading };
};
