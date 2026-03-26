import { COACHING_OBJECT_NAME_SINGULAR } from '@/coaching/constants/CoachingObjectNameSingular.constants';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const COACHING_DETAIL_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  fullName: true,
  email: true,
  phone: true,
  city: true,
};

export const useCoachingCustomerDetail = (customerId: string) => {
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular: COACHING_OBJECT_NAME_SINGULAR,
    objectRecordId: customerId,
    recordGqlFields: COACHING_DETAIL_GQL_FIELDS,
  });

  return {
    customer: record,
    loading,
    error,
  };
};
