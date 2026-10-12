import { renderHook } from '@testing-library/react';

import { useAddPeopleToMessageList } from '@/side-panel/pages/add-to-message-list/hooks/useAddPeopleToMessageList';

const query = jest.fn();
const createManyRecords = jest.fn();

const NAME_PLURAL_BY_OBJECT_NAME_SINGULAR: Record<string, string> = {
  person: 'people',
  messageListMember: 'messageListMembers',
};

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => ({
    objectMetadataItem: {
      namePlural: NAME_PLURAL_BY_OBJECT_NAME_SINGULAR[objectNameSingular],
    },
  }),
}));

jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => ({ findManyRecordsQuery: objectNameSingular }),
}));

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({ createManyRecords }),
}));

const LIST_ID = 'list-1';
const PERSON_FILTER = { city: { eq: 'Paris' } };

const buildPeoplePage = (personIds: string[], endCursor: string | null) => ({
  data: {
    people: {
      edges: personIds.map((id) => ({ node: { id } })),
      pageInfo: { hasNextPage: endCursor !== null, endCursor },
    },
  },
});

const mockWorkspace = ({
  peoplePages,
  personIdsAlreadyInList,
}: {
  peoplePages: ReturnType<typeof buildPeoplePage>[];
  personIdsAlreadyInList: string[];
}) => {
  let peoplePageIndex = 0;

  query.mockImplementation(
    ({
      query: queryName,
      variables,
    }: {
      query: string;
      variables: { filter: { personId: { in: string[] } } };
    }) => {
      if (queryName === 'person') {
        return Promise.resolve(peoplePages[peoplePageIndex++]);
      }

      return Promise.resolve({
        data: {
          messageListMembers: {
            edges: variables.filter.personId.in
              .filter((personId) => personIdsAlreadyInList.includes(personId))
              .map((personId) => ({
                node: { id: `member-${personId}`, personId },
              })),
          },
        },
      });
    },
  );
};

const addPeople = () =>
  renderHook(() =>
    useAddPeopleToMessageList(),
  ).result.current.addPeopleToMessageList({
    listId: LIST_ID,
    personFilter: PERSON_FILTER,
  });

describe('useAddPeopleToMessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createManyRecords.mockResolvedValue([]);
  });

  it('adds only the people who are not in the list yet', async () => {
    mockWorkspace({
      peoplePages: [buildPeoplePage(['p1', 'p2', 'p3'], null)],
      personIdsAlreadyInList: ['p2'],
    });

    await expect(addPeople()).resolves.toEqual({
      addedCount: 2,
      alreadyInListCount: 1,
    });
    expect(createManyRecords).toHaveBeenCalledWith({
      recordsToCreate: [
        { listId: LIST_ID, personId: 'p1' },
        { listId: LIST_ID, personId: 'p3' },
      ],
    });
  });

  it('goes through every page of the selection', async () => {
    mockWorkspace({
      peoplePages: [
        buildPeoplePage(['p1'], 'cursor-1'),
        buildPeoplePage(['p2'], null),
      ],
      personIdsAlreadyInList: [],
    });

    await expect(addPeople()).resolves.toEqual({
      addedCount: 2,
      alreadyInListCount: 0,
    });
    expect(
      query.mock.calls
        .filter(([{ query: queryName }]) => queryName === 'person')
        .map(([{ variables }]) => variables.lastCursor),
    ).toEqual([null, 'cursor-1']);
    expect(createManyRecords).toHaveBeenCalledTimes(2);
  });

  it('adds nobody when everyone is already in the list', async () => {
    mockWorkspace({
      peoplePages: [buildPeoplePage(['p1', 'p2'], null)],
      personIdsAlreadyInList: ['p1', 'p2'],
    });

    await expect(addPeople()).resolves.toEqual({
      addedCount: 0,
      alreadyInListCount: 2,
    });
    expect(createManyRecords).not.toHaveBeenCalled();
  });
});
