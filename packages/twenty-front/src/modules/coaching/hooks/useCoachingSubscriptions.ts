import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const SUBSCRIPTION_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  programName: true,
  subscriptionAppStatus: true,
  lifecycleStatus: true,
  startDate: true,
  endDate: true,
  customerEmail: true,
};

export const useCoachingSubscriptions = (customerEmail: string | null) => {
  const { records, loading } = useFindManyRecords({
    objectNameSingular: 'tobSubscription',
    filter: customerEmail
      ? { customerEmail: { eq: customerEmail } }
      : undefined,
    recordGqlFields: SUBSCRIPTION_GQL_FIELDS,
    limit: 100,
    skip: !customerEmail,
  });

  return { subscriptions: records, loading };
};
