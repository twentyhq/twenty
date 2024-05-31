import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { viewableEmailThreadIdState } from '@/activities/emails/states/viewableEmailThreadIdState';
import { EmailThread } from '@/activities/emails/types/EmailThread';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';

export const useRightDrawerEmailThread = () => {
  const viewableEmailThreadId = useRecoilValue(viewableEmailThreadIdState);
  const { setRecords } = useSetRecordInStore();

  const { record: thread } = useFindOneRecord<EmailThread>({
    objectNameSingular: CoreObjectNameSingular.MessageThread,
    objectRecordId: viewableEmailThreadId ?? '',
    recordGqlFields: {
      id: true,
    },
    onCompleted: (record) => setRecords([record]),
  });

  const FETCH_ALL_MESSAGES_OPERATION_SIGNATURE =
    fetchAllThreadMessagesOperationSignatureFactory({
      messageThreadId: viewableEmailThreadId,
    });

  const {
    records: messages,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords<EmailThreadMessageType>({
    limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
    filter: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.filter,
    objectNameSingular:
      FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.objectNameSingular,
    orderBy: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.orderBy,
    recordGqlFields: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.fields,
    skip: !viewableEmailThreadId,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!loading) {
      fetchMoreRecords();
    }
  }, [fetchMoreRecords, loading]);

  return {
    thread,
    messages,
    loading,
    fetchMoreMessages,
  };
};
