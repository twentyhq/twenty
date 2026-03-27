import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const FORM_SUBMISSION_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  wpUserId: true,
  email: true,
  formId: true,
  formTitle: true,
  status: true,
  submittedAt: true,
  responseData: true,
};

export const useCoachingFormSubmissions = (
  email: string | null,
  wpUserId: string | null,
) => {
  const filter =
    email || wpUserId
      ? {
          or: [
            ...(email ? [{ email: { eq: email } }] : []),
            ...(wpUserId ? [{ wpUserId: { eq: wpUserId } }] : []),
          ],
        }
      : undefined;

  const { records, loading } = useFindManyRecords({
    objectNameSingular: 'tobFormSubmission',
    filter,
    orderBy: [{ submittedAt: 'DescNullsLast' }],
    recordGqlFields: FORM_SUBMISSION_GQL_FIELDS,
    limit: 500,
    skip: !email && !wpUserId,
  });

  return { formSubmissions: records, loading };
};
