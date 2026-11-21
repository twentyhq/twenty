import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useListenToScopedRelationRecordOperation } from '@/object-record/record-column-scope/hooks/useListenToScopedRelationRecordOperation';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');

const COMPANY_ID = '20202020-1111-4000-8000-000000000001';
const PERSON_ID = '20202020-2222-4000-8000-000000000001';

const peopleAlias: ScopedRelationAlias = {
  recordFieldId: 'people-column',
  responseKey: 'people_scoped',
  relationFieldName: 'people',
  relationObjectMetadataItem: personObjectMetadataItem,
};

const PEOPLE_CONNECTION_SELECTION = `
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
        ${PEOPLE_CONNECTION_SELECTION}
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
        ${PEOPLE_CONNECTION_SELECTION}
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
    readCachedPeople: () =>
      apolloClient.cache.readQuery({ query: COMPANY_PEOPLE_QUERY }),
  };
};

describe('useListenToScopedRelationRecordOperation', () => {
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

    expect(onScopedRelationRecordOperation).not.toHaveBeenCalled();
    expect(readCachedScopedPeople()).not.toBeNull();
  });
});
