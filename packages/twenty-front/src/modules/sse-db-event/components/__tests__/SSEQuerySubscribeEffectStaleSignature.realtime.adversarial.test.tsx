import { act, render } from '@testing-library/react';
import { type DocumentNode } from 'graphql';
import { createStore, Provider } from 'jotai';

import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';

type MockSentMutation = {
  operationName: string;
  queryId: string;
  filter: unknown;
};

const mockSentMutations: MockSentMutation[] = [];

const mockSendMutation =
  (operationName: string) =>
  ({
    variables,
  }: {
    variables: {
      input: {
        eventStreamId: string;
        queryId: string;
        operationSignature?: { variables?: { filter?: unknown } };
      };
    };
  }) => {
    mockSentMutations.push({
      operationName,
      queryId: variables.input.queryId,
      filter: variables.input.operationSignature?.variables?.filter,
    });

    return Promise.resolve({
      data: {
        [operationName === 'AddQueryToEventStream'
          ? 'addQueryToEventStream'
          : 'removeQueryFromEventStream']: true,
      },
    });
  };

const mockAddQueryToEventStream = mockSendMutation('AddQueryToEventStream');
const mockRemoveQueryFromEventStream = mockSendMutation(
  'RemoveQueryFromEventStream',
);

jest.mock('@apollo/client/react', () => ({
  useMutation: (document: DocumentNode) => {
    const definition = document.definitions[0];

    return [
      'name' in definition && definition.name?.value === 'AddQueryToEventStream'
        ? mockAddQueryToEventStream
        : mockRemoveQueryFromEventStream,
    ];
  },
}));

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

// Same shape as RecordBoardSSESubscribeEffect: constant queryId, a filter
// object rebuilt on every render from the visible groups / view filters.
const BoardSubscriber = ({ visibleStages }: { visibleStages: string[] }) => {
  useListenToEventsForQuery({
    queryId: 'record-board-opportunities',
    operationSignature: {
      objectNameSingular: 'opportunity',
      variables: { filter: { stage: { in: visibleStages } }, orderBy: [] },
    },
  });

  return null;
};

describe('SSE query listener signature staleness (record board)', () => {
  beforeEach(() => {
    mockSentMutations.length = 0;
  });

  it('never re-sends the board query signature to the server after the visible groups change', async () => {
    const store = createStore();

    store.set(sseEventStreamIdState.atom, 'event-stream-1');
    store.set(sseEventStreamReadyState.atom, true);

    const { rerender } = render(
      <Provider store={store}>
        <SSEQuerySubscribeEffect />
        <BoardSubscriber visibleStages={['NEW', 'SCREENING', 'MEETING']} />
      </Provider>,
    );

    await flush();

    expect(mockSentMutations).toEqual([
      {
        operationName: 'AddQueryToEventStream',
        queryId: 'record-board-opportunities',
        filter: { stage: { in: ['NEW', 'SCREENING', 'MEETING'] } },
      },
    ]);

    // User hides "MEETING" (or shows a hidden column, or adds a view filter):
    // the client-side required listener carries the new signature...
    rerender(
      <Provider store={store}>
        <SSEQuerySubscribeEffect />
        <BoardSubscriber visibleStages={['NEW', 'SCREENING']} />
      </Provider>,
    );

    await flush();
    await flush();

    expect(
      store
        .get(requiredQueryListenersState.atom)
        .map((listener) => listener.operationSignature),
    ).toEqual([
      {
        objectNameSingular: 'opportunity',
        variables: { filter: { stage: { in: ['NEW', 'SCREENING'] } }, orderBy: [] },
      },
    ]);

    // ...but nothing is sent: the server keeps matching events against the
    // first filter it received for this queryId.
    expect(mockSentMutations).toHaveLength(1);
    expect(
      store
        .get(activeQueryListenersState.atom)
        .map((listener) => listener.operationSignature),
    ).toEqual([
      {
        objectNameSingular: 'opportunity',
        variables: {
          filter: { stage: { in: ['NEW', 'SCREENING', 'MEETING'] } },
          orderBy: [],
        },
      },
    ]);
  });
});
