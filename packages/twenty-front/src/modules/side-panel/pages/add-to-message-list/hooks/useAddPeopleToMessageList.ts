import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

export const useAddPeopleToMessageList = ({
  personFilter,
}: {
  personFilter: RecordGqlOperationFilter;
}) => {
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
    let addedPersonCount = 0;

    await incrementalFetchAndMutate(async ({ recordIds, totalCount }) => {
      await createManyMessageListMembers({
        recordsToCreate: recordIds.map((personId) => ({
          listId: messageListId,
          personId,
        })),
        upsert: true,
      });

      addedPersonCount += recordIds.length;

      updateProgress(addedPersonCount, totalCount);
    });

    return addedPersonCount;
  };

  return {
    addPeopleToMessageList,
    isAdding: isProcessing,
    progress,
    cancel,
  };
};
