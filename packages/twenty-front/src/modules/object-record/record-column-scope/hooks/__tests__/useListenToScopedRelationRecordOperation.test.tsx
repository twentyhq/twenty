import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useListenToScopedRelationRecordOperation } from '@/object-record/record-column-scope/hooks/useListenToScopedRelationRecordOperation';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');

const COMPANY_ID = '20202020-1111-4000-8000-000000000001';
const PERSON_ID = '20202020-2222-4000-8000-000000000001';
const TASK_TARGET_ID = '20202020-3333-4000-8000-000000000001';

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
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
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

  renderHook(
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
});
