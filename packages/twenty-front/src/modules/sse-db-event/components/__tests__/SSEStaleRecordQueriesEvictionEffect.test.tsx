import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render } from '@testing-library/react';
import { atom, createStore, Provider } from 'jotai';

import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { SSEStaleRecordQueriesEvictionEffect } from '@/sse-db-event/components/SSEStaleRecordQueriesEvictionEffect';
import { AllMetadataName } from '~/generated-metadata/graphql';

jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => ({
  objectMetadataItemsSelector: {
    atom: atom([
      { id: 'person-object-id', namePlural: 'people' },
      { id: 'company-object-id', namePlural: 'companies' },
    ]),
  },
}));

const PEOPLE_QUERY = gql`
  query FindManyPeople($filter: PersonFilterInput) {
    people(filter: $filter) {
      totalCount
    }
  }
`;

const COMPANIES_QUERY = gql`
  query FindManyCompanies {
    companies {
      totalCount
    }
  }
`;

const setup = () => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });

  client.cache.writeQuery({
    query: PEOPLE_QUERY,
    variables: { filter: { isRecurringDonor: { eq: true } } },
    data: { people: { __typename: 'PersonConnection', totalCount: 3 } },
  });
  client.cache.writeQuery({
    query: PEOPLE_QUERY,
    variables: { filter: {} },
    data: { people: { __typename: 'PersonConnection', totalCount: 10 } },
  });
  client.cache.writeQuery({
    query: COMPANIES_QUERY,
    data: { companies: { __typename: 'CompanyConnection', totalCount: 5 } },
  });

  render(
    <Provider store={createStore()}>
      <ApolloProvider client={client}>
        <SSEStaleRecordQueriesEvictionEffect />
      </ApolloProvider>
    </Provider>,
  );

  const getCachedRootFieldNames = () =>
    Object.keys(
      (client.cache.extract() as { ROOT_QUERY?: Record<string, unknown> })
        .ROOT_QUERY ?? {},
    ).filter((key) => key !== '__typename');

  return { getCachedRootFieldNames };
};

describe('SSEStaleRecordQueriesEvictionEffect', () => {
  it('evicts every cached query of the object whose field was renamed', () => {
    const { getCachedRootFieldNames } = setup();

    expect(
      getCachedRootFieldNames().filter((key) => key.startsWith('people')),
    ).toHaveLength(2);

    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: AllMetadataName.fieldMetadata,
        operation: {
          type: 'update',
          updatedRecord: {
            id: 'field-id',
            name: 'isRecurring',
            objectMetadataId: 'person-object-id',
          },
          updatedFields: ['name'],
        },
      });
    });

    expect(getCachedRootFieldNames()).toEqual(['companies']);
  });

  it('keeps cached queries when a field update leaves its name unchanged', () => {
    const { getCachedRootFieldNames } = setup();

    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: AllMetadataName.fieldMetadata,
        operation: {
          type: 'update',
          updatedRecord: {
            id: 'field-id',
            name: 'isRecurring',
            objectMetadataId: 'person-object-id',
          },
          updatedFields: ['label'],
        },
      });
    });

    expect(getCachedRootFieldNames()).toHaveLength(3);
  });

  it('evicts cached queries of the object whose field was deleted', () => {
    const { getCachedRootFieldNames } = setup();

    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: AllMetadataName.fieldMetadata,
        operation: {
          type: 'delete',
          deletedRecordId: 'field-id',
          deletedRecord: {
            id: 'field-id',
            name: 'isRecurringDonor',
            objectMetadataId: 'person-object-id',
          },
        },
      });
    });

    expect(getCachedRootFieldNames()).toEqual(['companies']);
  });
});
