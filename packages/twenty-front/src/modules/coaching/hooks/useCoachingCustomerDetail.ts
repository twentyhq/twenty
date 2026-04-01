import { COACHING_OBJECT_NAME_SINGULAR } from '@/coaching/constants/CoachingObjectNameSingular.constants';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const APP_USER_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  wpUserId: true,
  email: true,
  displayName: true,
  registeredDate: true,
};

const CUSTOMER_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  city: true,
  appUserId: true,
  appRegisteredDate: true,
  contractName: true,
};

export const useCoachingCustomerDetail = (appUserId: string) => {
  const { record: appUser, loading: appUserLoading } = useFindOneRecord({
    objectNameSingular: COACHING_OBJECT_NAME_SINGULAR,
    objectRecordId: appUserId,
    recordGqlFields: APP_USER_GQL_FIELDS,
  });

  const email = (appUser?.email as string | null) ?? null;
  const wpUserId = (appUser?.wpUserId as string | null) ?? null;

  const { records: customers, loading: customerLoading } = useFindManyRecords({
    objectNameSingular: 'tobCustomer',
    filter: email
      ? { email: { eq: email } }
      : wpUserId
        ? { appUserId: { eq: wpUserId } }
        : undefined,
    recordGqlFields: CUSTOMER_GQL_FIELDS,
    limit: 1,
    skip: !email && !wpUserId,
  });

  const customer = customers.length > 0 ? customers[0] : null;

  return {
    appUser: appUser,
    customer,
    loading: appUserLoading || customerLoading,
  };
};
