import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useListenToScopedRelationRecordOperation } from '@/object-record/record-column-scope/hooks/useListenToScopedRelationRecordOperation';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryTestingCacheInstance } from '~/testing/cache/inMemoryTestingCacheInstance';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const COMPANY_ID = '20202020-1111-4000-8000-000000000001';
const PERSON_ID = '20202020-2222-4000-8000-000000000001';
const NEW_PERSON_ID = '20202020-2222-4000-8000-000000000002';
const TASK_TARGET_ID = '20202020-3333-4000-8000-000000000001';

const buildPerson = ({
  id,
  city,
}: {
  id: string;
  city: string;
}): ObjectRecord => ({
  __typename: 'Person',
  id,
  city,
  companyId: COMPANY_ID,
  company: { __typename: 'Company', id: COMPANY_ID },
});

const peopleAlias: ScopedRelationAlias = {
  recordFieldId: 'people-column',
  responseKey: 'people_scoped',
  relationObjectMetadataItem: personObjectMetadataItem,
  relationWithArguments: {
    relationFieldName: 'people',
    recordGqlFields: { id: true },
  },
  reachedObjectMetadataItemIds: [personObjectMetadataItem.id],
  isRestricted: false,
};

const CONNECTION_SELECTION = `
  __typename
  edges {
    __typename
    node {
      __typename
      id
    }
  }
`;

const COMPANY_PEOPLE_QUERY = gql`
  query CompanyPeople {
    company {
      __typename
      id
      people {
        ${CONNECTION_SELECTION}
      }
    }
  }
`;

const COMPANY_SCOPED_PEOPLE_QUERY = gql`
  query CompanyScopedPeople($first: Int) {
    company {
      __typename
      id
      people_scoped: people(first: $first) {
        ${CONNECTION_SELECTION}
      }
    }
  }
`;

const COMPANY_SCOPED_TASK_TARGETS_QUERY = gql`
  query CompanyScopedTaskTargets($first: Int) {
    company {
      __typename
      id
      taskTargets_scoped: taskTargets(first: $first) {
        ${CONNECTION_SELECTION}
      }
    }
  }
`;

const PEOPLE_CONNECTION = {
  __typename: 'PersonConnection',
  edges: [
    {
      __typename: 'PersonEdge',
      node: { __typename: 'Person', id: PERSON_ID },
    },
  ],
};

const DEBOUNCE_TIME_IN_MS = 100;

const waitForDebounce = () =>
  act(() => {
    jest.advanceTimersByTime(DEBOUNCE_TIME_IN_MS);
  });

const buildApolloClient = () => {
  const { cache } = new InMemoryTestingCacheInstance({
    objectMetadataItems,
    initialRecordsInCache: [
      {
        objectMetadataItem: personObjectMetadataItem,
        records: [
          buildPerson({ id: PERSON_ID, city: 'Paris' }),
          buildPerson({ id: NEW_PERSON_ID, city: 'Paris' }),
        ],
      },
    ],
  });

  const apolloClient = new ApolloClient({
    cache,
    link: ApolloLink.empty(),
  });

  apolloClient.cache.writeQuery({
    query: COMPANY_PEOPLE_QUERY,
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        people: PEOPLE_CONNECTION,
      },
    },
  });
  apolloClient.cache.writeQuery({
    query: COMPANY_SCOPED_PEOPLE_QUERY,
    variables: { first: 1 },
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        people_scoped: PEOPLE_CONNECTION,
      },
    },
  });

  apolloClient.cache.writeQuery({
    query: COMPANY_SCOPED_TASK_TARGETS_QUERY,
    variables: { first: 1 },
    data: {
      company: {
        __typename: 'Company',
        id: COMPANY_ID,
        taskTargets_scoped: {
          __typename: 'TaskTargetConnection',
          edges: [
            {
              __typename: 'TaskTargetEdge',
              node: { __typename: 'TaskTarget', id: TASK_TARGET_ID },
            },
          ],
        },
      },
    },
  });

  return apolloClient;
};

const renderListener = (scopedRelationAliases: ScopedRelationAlias[]) => {
  const onScopedRelationRecordOperation = jest.fn();
  const apolloClient = buildApolloClient();

  const { unmount } = renderHook(
    () =>
      useListenToScopedRelationRecordOperation({
        objectNameSingular: 'company',
        onScopedRelationRecordOperation,
        debounceTimeInMs: DEBOUNCE_TIME_IN_MS,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ApolloProvider client={apolloClient}>
          <ScopedRelationAliasesContext.Provider value={scopedRelationAliases}>
            {children}
          </ScopedRelationAliasesContext.Provider>
        </ApolloProvider>
      ),
    },
  );

  return {
    apolloClient,
    unmount,
    onScopedRelationRecordOperation,
    readCachedScopedPeople: () =>
      apolloClient.cache.readQuery({
        query: COMPANY_SCOPED_PEOPLE_QUERY,
        variables: { first: 1 },
      }),
    readCachedScopedTaskTargets: () =>
      apolloClient.cache.readQuery({
        query: COMPANY_SCOPED_TASK_TARGETS_QUERY,
        variables: { first: 1 },
      }),
    readCachedPeople: () =>
      apolloClient.cache.readQuery({ query: COMPANY_PEOPLE_QUERY }),
    readCachedPeopleIds: () =>
      apolloClient.cache
        .readQuery<{
          company: { people: { edges: { node: { id: string } }[] } };
        }>({ query: COMPANY_PEOPLE_QUERY })
        ?.company.people.edges.map(({ node }) => node.id),
  };
};

describe('useListenToScopedRelationRecordOperation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('drops the cached scoped values and reloads once for a burst of writes', () => {
    const { onScopedRelationRecordOperation, readCachedScopedPeople } =
      renderListener([peopleAlias]);

    for (const deletedRecordId of ['first-person', 'second-person']) {
      dispatchObjectRecordOperationBrowserEvent({
        objectMetadataItem: personObjectMetadataItem,
        operation: { type: 'delete-one', deletedRecordId },
      });
    }

    expect(onScopedRelationRecordOperation).not.toHaveBeenCalled();

    waitForDebounce();

    expect(onScopedRelationRecordOperation).toHaveBeenCalledTimes(1);
    expect(readCachedScopedPeople()).toBeNull();
  });

  it('drops the cached scoped values and reloads when a record of a scoped column object is written', () => {
    const {
      onScopedRelationRecordOperation,
      readCachedScopedPeople,
      readCachedPeople,
    } = renderListener([peopleAlias]);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: personObjectMetadataItem,
      operation: { type: 'delete-one', deletedRecordId: 'person' },
    });

    waitForDebounce();

    expect(onScopedRelationRecordOperation).toHaveBeenCalledTimes(1);
    expect(readCachedScopedPeople()).toBeNull();
    expect(readCachedPeople()).not.toBeNull();
  });

  it('ignores a record of an object no scoped column shows', () => {
    const { onScopedRelationRecordOperation, readCachedScopedPeople } =
      renderListener([peopleAlias]);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: taskObjectMetadataItem,
      operation: { type: 'delete-one', deletedRecordId: 'task' },
    });

    waitForDebounce();

    expect(onScopedRelationRecordOperation).not.toHaveBeenCalled();
    expect(readCachedScopedPeople()).not.toBeNull();
  });

  it('drops the cached scoped values and reloads when a target record of a join object column is written', () => {
    const scopedRelationJunction = resolveScopedRelationJunction({
      fieldMetadataItem: getMockFieldMetadataItemOrThrow({
        objectMetadataItem: companyObjectMetadataItem,
        fieldName: 'taskTargets',
      }),
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    })?.scopedRelationJunction;
    const {
      onScopedRelationRecordOperation,
      readCachedScopedTaskTargets,
      readCachedScopedPeople,
    } = renderListener([
      {
        recordFieldId: 'task-targets-column',
        responseKey: 'taskTargets_scoped',
        relationObjectMetadataItem:
          getMockObjectMetadataItemOrThrow('taskTarget'),
        relationWithArguments: {
          relationFieldName: 'taskTargets',
          recordGqlFields: { id: true },
        },
        scopedRelationJunction,
        reachedObjectMetadataItemIds: [
          getMockObjectMetadataItemOrThrow('taskTarget').id,
          taskObjectMetadataItem.id,
        ],
        isRestricted: false,
      },
    ]);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: taskObjectMetadataItem,
      operation: { type: 'delete-one', deletedRecordId: 'task' },
    });

    waitForDebounce();

    expect(onScopedRelationRecordOperation).toHaveBeenCalledTimes(1);
    expect(readCachedScopedTaskTargets()).toBeNull();
    expect(readCachedScopedPeople()).not.toBeNull();
  });

  it('drops the cached scoped values without reloading when the table unmounts', () => {
    const {
      unmount,
      onScopedRelationRecordOperation,
      readCachedScopedPeople,
      readCachedPeople,
    } = renderListener([peopleAlias]);

    unmount();

    expect(onScopedRelationRecordOperation).not.toHaveBeenCalled();
    expect(readCachedScopedPeople()).toBeNull();
    expect(readCachedPeople()).not.toBeNull();
  });

  const companyPeopleRelationArguments = {
    targetObjectMetadataItem: companyObjectMetadataItem,
    fieldNameOnTargetRecord: 'people',
    targetRecordId: COMPANY_ID,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId: {},
    upsertRecordsInStore: jest.fn(),
  };

  it.each([
    {
      write: 'a person is attached to the company',
      runOptimisticEffect: (apolloClient: ApolloClient) =>
        triggerAttachRelationOptimisticEffect({
          ...companyPeopleRelationArguments,
          cache: apolloClient.cache,
          sourceObjectNameSingular: 'person',
          sourceRecord: buildPerson({ id: NEW_PERSON_ID, city: 'Paris' }),
        }),
      expectedPeopleIds: [PERSON_ID, NEW_PERSON_ID],
    },
    {
      write: 'a person is detached from the company',
      runOptimisticEffect: (apolloClient: ApolloClient) =>
        triggerDetachRelationOptimisticEffect({
          ...companyPeopleRelationArguments,
          cache: apolloClient.cache,
          sourceObjectNameSingular: 'person',
          sourceRecordId: PERSON_ID,
        }),
      expectedPeopleIds: [],
    },
    {
      write: 'an attached person moves out of the scope',
      runOptimisticEffect: (apolloClient: ApolloClient) =>
        triggerUpdateRelationsOptimisticEffect({
          cache: apolloClient.cache,
          sourceObjectMetadataItem: personObjectMetadataItem,
          currentSourceRecord: buildPerson({ id: PERSON_ID, city: 'Paris' }),
          updatedSourceRecord: buildPerson({ id: PERSON_ID, city: 'London' }),
          objectMetadataItems,
          objectPermissionsByObjectMetadataId: {},
          upsertRecordsInStore: jest.fn(),
        }),
      expectedPeopleIds: [PERSON_ID],
    },
  ])(
    'refreshes the scoped values once $write, while the optimistic effect only updates the plain relation',
    ({ runOptimisticEffect, expectedPeopleIds }) => {
      const {
        apolloClient,
        onScopedRelationRecordOperation,
        readCachedScopedPeople,
        readCachedPeopleIds,
      } = renderListener([peopleAlias]);
      const cachedScopedPeople = readCachedScopedPeople();

      runOptimisticEffect(apolloClient);

      expect(readCachedPeopleIds()).toEqual(expectedPeopleIds);
      expect(readCachedScopedPeople()).toEqual(cachedScopedPeople);

      dispatchObjectRecordOperationBrowserEvent({
        objectMetadataItem: personObjectMetadataItem,
        operation: {
          type: 'update-one',
          result: {
            updateInput: { recordId: PERSON_ID, updatedFields: [] },
          },
        },
      });

      waitForDebounce();

      expect(onScopedRelationRecordOperation).toHaveBeenCalledTimes(1);
      expect(readCachedScopedPeople()).toBeNull();
      expect(readCachedPeopleIds()).toEqual(expectedPeopleIds);
    },
  );
});
