import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const SESSION_PARTICIPATION_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  wpUserId: true,
  email: true,
  sessionId: true,
  sessionTitle: true,
  sessionDatetime: true,
  dateCreated: true,
};

export const useCoachingSessionParticipation = (
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
    objectNameSingular: 'tobSessionParticipation',
    filter,
    orderBy: [{ sessionDatetime: 'DescNullsLast' }],
    recordGqlFields: SESSION_PARTICIPATION_GQL_FIELDS,
    limit: 500,
    skip: !email && !wpUserId,
  });

  return { sessions: records, loading };
};
