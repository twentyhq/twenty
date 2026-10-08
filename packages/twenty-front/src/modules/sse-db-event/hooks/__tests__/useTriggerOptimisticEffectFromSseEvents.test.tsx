import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useTriggerOptimisticEffectFromSseEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents';
import { DatabaseEventAction } from '~/generated-metadata/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

jest.mock(
  '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem',
  () => ({
    useRefetchAggregateQueriesForObjectMetadataItem: () => ({
      refetchAggregateQueriesForObjectMetadataItem: jest.fn(),
    }),
  }),
);

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));

jest.mock(
  '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseUpdateEvents',
  () => ({
    useTriggerOptimisticEffectFromSseUpdateEvents: () => ({
      triggerOptimisticEffectFromSseUpdateEvents: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseDeleteEvents',
  () => ({
    useTriggerOptimisticEffectFromSseDeleteEvents: () => ({
      triggerOptimisticEffectFromSseDeleteEvents: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseRestoreEvents',
  () => ({
    useTriggerOptimisticEffectFromSseRestoreEvents: () => ({
      triggerOptimisticEffectFromSseRestoreEvents: jest.fn(),
    }),
  }),
);

const taskObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  ({ nameSingular }) => nameSingular === 'task',
)!;

const actionItemObjectMetadataItem: EnrichedObjectMetadataItem = {
  ...taskObjectMetadataItem,
  nameSingular: 'actionItem',
  namePlural: 'actionItems',
  fields: taskObjectMetadataItem.fields.filter(
    ({ name }) => name === 'id' || name === 'status',
  ),
};

const ACTION_ITEMS_QUERY = gql`
  query ActionItems($filter: ActionItemFilterInput) {
    actionItems(filter: $filter) {
      __typename
      edges {
        __typename
        node {
          __typename
          id
        }
        cursor
      }
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const CREATED_ACTION_ITEM = {
  __typename: 'ActionItem',
  id: '20202020-0000-4000-8000-000000000001',
  status: 'TODO',
};

describe('useTriggerOptimisticEffectFromSseEvents', () => {
  it.each([
    {
      name: 'uses current field metadata when a retained subscription callback receives a create event',
      initialObjectMetadataItems: [
        {
          ...actionItemObjectMetadataItem,
          fields: actionItemObjectMetadataItem.fields.filter(
            ({ name }) => name === 'id',
          ),
        },
      ],
    },
    {
      name: 'processes create events for objects loaded after the subscription callback was retained',
      initialObjectMetadataItems: [],
    },
  ])('$name', ({ initialObjectMetadataItems }) => {
    const store = createStore();
    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache, link: ApolloLink.empty() });
    const queryVariables = { filter: { status: { eq: 'TODO' } } };

    setTestObjectMetadataItemsInMetadataStore(
      store,
      initialObjectMetadataItems,
    );

    cache.writeQuery({
      query: ACTION_ITEMS_QUERY,
      variables: queryVariables,
      data: {
        actionItems: {
          __typename: 'ActionItemConnection',
          edges: [],
          totalCount: 0,
          pageInfo: {
            startCursor: null,
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    });

    cache.writeFragment({
      fragment: gql`
        fragment CreatedActionItem on ActionItem {
          id
          status
        }
      `,
      data: CREATED_ACTION_ITEM,
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </JotaiProvider>
    );

    const { result } = renderHook(
      () => useTriggerOptimisticEffectFromSseEvents(),
      {
        wrapper: Wrapper,
      },
    );

    const retainedSubscriptionCallback =
      result.current.triggerOptimisticEffectFromSseEvents;

    act(() => {
      setTestObjectMetadataItemsInMetadataStore(store, [
        actionItemObjectMetadataItem,
      ]);
    });

    expect(() =>
      retainedSubscriptionCallback({
        objectRecordEvents: [
          {
            action: DatabaseEventAction.CREATED,
            objectNameSingular: 'actionItem',
            recordId: CREATED_ACTION_ITEM.id,
            properties: { after: CREATED_ACTION_ITEM },
          },
        ],
      }),
    ).not.toThrow();

    expect(
      cache.readQuery({
        query: ACTION_ITEMS_QUERY,
        variables: queryVariables,
      }),
    ).toMatchObject({
      actionItems: {
        edges: [{ node: { id: CREATED_ACTION_ITEM.id } }],
        totalCount: 1,
      },
    });
  });

  it('uses current related object metadata when a retained subscription callback receives a create event', () => {
    const opportunityMetadata = getTestEnrichedObjectMetadataItemsMock().find(
      ({ nameSingular }) => nameSingular === 'opportunity',
    )!;
    const personMetadata = getTestEnrichedObjectMetadataItemsMock().find(
      ({ nameSingular }) => nameSingular === 'person',
    )!;
    const opportunityObjectMetadataItem = {
      ...opportunityMetadata,
      fields: opportunityMetadata.fields.filter(
        ({ name }) => name === 'id' || name === 'pointOfContact',
      ),
    };
    const personObjectMetadataItem = {
      ...personMetadata,
      fields: personMetadata.fields.filter(
        ({ name }) =>
          name === 'id' || name === 'pointOfContactForOpportunities',
      ),
    };
    const store = createStore();
    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache, link: ApolloLink.empty() });
    const personId = '20202020-0000-4000-8000-000000000002';
    const opportunity = {
      __typename: 'Opportunity',
      id: '20202020-0000-4000-8000-000000000003',
      pointOfContact: { __typename: 'Person', id: personId },
    };
    const queryVariables = {
      filter: { pointOfContact: { id: { eq: personId } } },
    };
    const OPPORTUNITIES_QUERY = gql`
      query Opportunities($filter: OpportunityFilterInput) {
        opportunities(filter: $filter) {
          __typename
          edges {
            __typename
            node {
              __typename
              id
            }
            cursor
          }
          totalCount
        }
      }
    `;

    setTestObjectMetadataItemsInMetadataStore(store, [
      opportunityObjectMetadataItem,
    ]);

    cache.writeQuery({
      query: OPPORTUNITIES_QUERY,
      variables: queryVariables,
      data: {
        opportunities: {
          __typename: 'OpportunityConnection',
          edges: [],
          totalCount: 0,
        },
      },
    });

    cache.writeFragment({
      fragment: gql`
        fragment CreatedOpportunity on Opportunity {
          id
        }
      `,
      data: opportunity,
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </JotaiProvider>
    );

    const { result } = renderHook(
      () => useTriggerOptimisticEffectFromSseEvents(),
      { wrapper: Wrapper },
    );
    const retainedSubscriptionCallback =
      result.current.triggerOptimisticEffectFromSseEvents;

    act(() => {
      setTestObjectMetadataItemsInMetadataStore(store, [
        opportunityObjectMetadataItem,
        personObjectMetadataItem,
      ]);
    });

    expect(() =>
      retainedSubscriptionCallback({
        objectRecordEvents: [
          {
            action: DatabaseEventAction.CREATED,
            objectNameSingular: 'opportunity',
            recordId: opportunity.id,
            properties: { after: opportunity },
          },
        ],
      }),
    ).not.toThrow();

    expect(
      cache.readQuery({
        query: OPPORTUNITIES_QUERY,
        variables: queryVariables,
      }),
    ).toMatchObject({
      opportunities: {
        edges: [{ node: { id: opportunity.id } }],
        totalCount: 1,
      },
    });
  });
});
