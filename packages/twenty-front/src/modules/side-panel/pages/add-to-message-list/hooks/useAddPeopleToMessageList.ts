import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type AddPeopleToMessageListParams = {
  listId: string;
  personFilter: RecordGqlOperationFilter;
};

export const useAddPeopleToMessageList = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });

  const { objectMetadataItem: listMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.MessageListMember,
    });

  const { findManyRecordsQuery: findPeopleQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.Person,
    recordGqlFields: { id: true },
  });

  const { findManyRecordsQuery: findListMembersQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.MessageListMember,
      recordGqlFields: { id: true, personId: true },
    });

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular: CoreObjectNameSingular.MessageListMember,
  });

  const findPeoplePage = async (
    personFilter: RecordGqlOperationFilter,
    lastCursor: string | null,
  ) => {
    const { data } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findPeopleQuery,
        variables: {
          filter: personFilter,
          limit: QUERY_MAX_RECORDS,
          lastCursor,
        },
        fetchPolicy: 'network-only',
      });

    const peopleConnection = data?.[personObjectMetadataItem.namePlural];

    return {
      personIds:
        peopleConnection?.edges.map(({ node }) => node.id as string) ?? [],
      nextCursor:
        peopleConnection?.pageInfo.hasNextPage === true
          ? (peopleConnection.pageInfo.endCursor ?? null)
          : null,
    };
  };

  const findPersonIdsAlreadyInList = async (
    listId: string,
    personIds: string[],
  ) => {
    const { data } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findListMembersQuery,
        variables: {
          filter: { listId: { eq: listId }, personId: { in: personIds } },
          limit: personIds.length,
        },
        fetchPolicy: 'network-only',
      });

    return new Set(
      data?.[listMemberObjectMetadataItem.namePlural]?.edges.map(
        ({ node }) => node.personId as string,
      ) ?? [],
    );
  };

  const addPeopleToMessageList = async ({
    listId,
    personFilter,
  }: AddPeopleToMessageListParams) => {
    let addedCount = 0;
    let alreadyInListCount = 0;
    let lastCursor: string | null = null;

    do {
      const { personIds, nextCursor } = await findPeoplePage(
        personFilter,
        lastCursor,
      );

      if (personIds.length > 0) {
        const personIdsAlreadyInList = await findPersonIdsAlreadyInList(
          listId,
          personIds,
        );
        const personIdsToAdd = personIds.filter(
          (personId) => !personIdsAlreadyInList.has(personId),
        );

        if (personIdsToAdd.length > 0) {
          await createManyRecords({
            recordsToCreate: personIdsToAdd.map((personId) => ({
              listId,
              personId,
            })),
          });
        }

        addedCount += personIdsToAdd.length;
        alreadyInListCount += personIds.length - personIdsToAdd.length;
      }

      lastCursor = nextCursor;
    } while (isDefined(lastCursor));

    return { addedCount, alreadyInListCount };
  };

  return { addPeopleToMessageList };
};
