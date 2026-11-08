import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useTriggerOptimisticEffectFromSseUpdateEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseUpdateEvents';
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

const taskMetadata = getTestEnrichedObjectMetadataItemsMock().find(
  ({ nameSingular }) => nameSingular === 'task',
)!;

const taskObjectMetadataItem: EnrichedObjectMetadataItem = {
  ...taskMetadata,
  fields: taskMetadata.fields.filter(({ name }) =>
    ['id', 'title', 'updatedAt'].includes(name),
  ),
};

const TASK_ID = '20202020-0000-4000-8000-000000000001';

const renderUpdateEventsHook = () => {
  const store = createStore();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });

  setTestObjectMetadataItemsInMetadataStore(store, [taskObjectMetadataItem]);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </JotaiProvider>
  );

  const { result } = renderHook(
    () => useTriggerOptimisticEffectFromSseUpdateEvents(),
    { wrapper: Wrapper },
  );

  const receiveUpdateEvent = (after: Record<string, unknown>) =>
    result.current.triggerOptimisticEffectFromSseUpdateEvents({
      objectMetadataItem: taskObjectMetadataItem,
      objectRecordEvents: [
        {
          action: DatabaseEventAction.UPDATED,
          objectNameSingular: 'task',
          recordId: TASK_ID,
          properties: { after },
        },
      ],
    });

  const getRecordInStore = () =>
    store.get(recordStoreFamilyState.atomFamily(TASK_ID));

  return { store, receiveUpdateEvent, getRecordInStore };
};

describe('useTriggerOptimisticEffectFromSseUpdateEvents', () => {
  it('updates a record that is in the record store but not in the Apollo cache', () => {
    const { store, receiveUpdateEvent, getRecordInStore } =
      renderUpdateEventsHook();

    store.set(recordStoreFamilyState.atomFamily(TASK_ID), {
      __typename: 'Task',
      id: TASK_ID,
      title: 'Before',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    receiveUpdateEvent({
      id: TASK_ID,
      title: 'After',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(getRecordInStore()).toMatchObject({ title: 'After' });
  });

  it('ignores an event older than the record in the record store', () => {
    const { store, receiveUpdateEvent, getRecordInStore } =
      renderUpdateEventsHook();

    store.set(recordStoreFamilyState.atomFamily(TASK_ID), {
      __typename: 'Task',
      id: TASK_ID,
      title: 'Latest',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    receiveUpdateEvent({
      id: TASK_ID,
      title: 'Outdated',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(getRecordInStore()).toMatchObject({ title: 'Latest' });
  });

  it('does not add a record that nothing has loaded', () => {
    const { receiveUpdateEvent, getRecordInStore } = renderUpdateEventsHook();

    receiveUpdateEvent({
      id: TASK_ID,
      title: 'After',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(getRecordInStore()).toBeNull();
  });
});
