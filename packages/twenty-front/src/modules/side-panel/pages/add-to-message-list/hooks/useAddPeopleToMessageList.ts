import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useState } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

export const useAddPeopleToMessageList = ({
  personFilter,
}: {
  personFilter: RecordGqlOperationFilter;
}) => {
  const [
    messageListMembersAbortController,
    setMessageListMembersAbortController,
  ] = useState<AbortController | null>(null);

  const { createManyRecords: createManyMessageListMembers } =
    useCreateManyRecords({
      objectNameSingular: 'messageListMember',
      recordGqlFields: { id: true, listId: true, personId: true },
    });

  const {
    incrementalFetchAndMutate,
    progress,
    isProcessing,
    updateProgress,
    cancel,
  } = useIncrementalFetchAndMutateRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: personFilter,
    recordGqlFields: { id: true },
  });

  const addPeopleToMessageList = async (messageListId: string) => {
    const runAbortController = new AbortController();

    setMessageListMembersAbortController(runAbortController);

    let listedPersonCount = 0;

    await incrementalFetchAndMutate(async ({ recordIds, totalCount }) => {
      await createManyMessageListMembers({
        recordsToCreate: recordIds.map((personId) => ({
          listId: messageListId,
          personId,
        })),
        upsert: true,
        abortController: runAbortController,
      }).catch((error) => {
        if (!runAbortController.signal.aborted) {
          throw error;
        }
      });

      listedPersonCount += recordIds.length;

      updateProgress(listedPersonCount, totalCount);
    });

    return runAbortController.signal.aborted ? undefined : listedPersonCount;
  };

  const cancelAddingPeopleToMessageList = () => {
    cancel();
    messageListMembersAbortController?.abort();
  };

  return {
    addPeopleToMessageList,
    isAdding: isProcessing,
    progress,
    cancel: cancelAddingPeopleToMessageList,
  };
};
