import { act, render } from '@testing-library/react';
import { type DocumentNode } from 'graphql';
import { createStore, Provider } from 'jotai';

import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';

type MockSentMutation = {
  operationName: string;
  eventStreamId: string;
  queryId: string;
  resolve: () => void;
};

const mockSentMutations: MockSentMutation[] = [];

const mockSendMutation =
  (operationName: string) =>
  ({
    variables,
  }: {
    variables: { input: { eventStreamId: string; queryId: string } };
  }) =>
    new Promise((resolve) => {
      mockSentMutations.push({
        operationName,
        eventStreamId: variables.input.eventStreamId,
        queryId: variables.input.queryId,
        resolve: () =>
          resolve({
            data: {
              [operationName === 'AddQueryToEventStream'
                ? 'addQueryToEventStream'
                : 'removeQueryFromEventStream']: true,
            },
          }),
      });
    });

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

const buildQueryListener = (queryId: string) => ({
  queryId,
  operationSignature: { objectNameSingular: 'workflowRun', variables: {} },
});

const getSentMutations = () =>
  mockSentMutations.map(({ operationName, queryId }) => ({
    operationName,
    queryId,
  }));

const flushAfter = async (callback: () => void = () => {}) => {
  await act(async () => {
    callback();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const setup = ({
  queryListeners = [],
}: {
  queryListeners?: ReturnType<typeof buildQueryListener>[];
} = {}) => {
  const store = createStore();

  store.set(sseEventStreamIdState.atom, 'event-stream-1');
  store.set(sseEventStreamReadyState.atom, true);
  store.set(requiredQueryListenersState.atom, queryListeners);
  store.set(activeQueryListenersState.atom, queryListeners);

  render(
    <Provider store={store}>
      <SSEQuerySubscribeEffect />
    </Provider>,
  );

  return { store };
};

describe('SSEQuerySubscribeEffect', () => {
  beforeEach(() => {
    mockSentMutations.length = 0;
  });

  it('should register a listener as soon as the previous registration settles', async () => {
    const { store } = setup();

    await flushAfter(() =>
      store.set(requiredQueryListenersState.atom, [
        buildQueryListener('record-table'),
      ]),
    );

    await flushAfter(() =>
      store.set(requiredQueryListenersState.atom, [
        buildQueryListener('record-table'),
        buildQueryListener('workflow-run'),
      ]),
    );

    expect(getSentMutations()).toEqual([
      { operationName: 'AddQueryToEventStream', queryId: 'record-table' },
    ]);

    await flushAfter(() => mockSentMutations[0].resolve());

    expect(getSentMutations()).toEqual([
      { operationName: 'AddQueryToEventStream', queryId: 'record-table' },
      { operationName: 'AddQueryToEventStream', queryId: 'workflow-run' },
    ]);

    await flushAfter(() => mockSentMutations[1].resolve());

    expect(
      store.get(activeQueryListenersState.atom).map(({ queryId }) => queryId),
    ).toEqual(['record-table', 'workflow-run']);
  });

  it('should wait for an in-flight registration before removing a listener', async () => {
    const { store } = setup({
      queryListeners: [buildQueryListener('closed-panel')],
    });

    await flushAfter(() =>
      store.set(requiredQueryListenersState.atom, [
        buildQueryListener('opened-panel'),
      ]),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(getSentMutations()).toEqual([
      { operationName: 'AddQueryToEventStream', queryId: 'opened-panel' },
    ]);

    await flushAfter(() => mockSentMutations[0].resolve());

    expect(getSentMutations()).toEqual([
      { operationName: 'AddQueryToEventStream', queryId: 'opened-panel' },
      { operationName: 'RemoveQueryFromEventStream', queryId: 'closed-panel' },
    ]);
  });

  it('should register listeners on a new stream while a request to the previous one is still pending', async () => {
    const { store } = setup();

    await flushAfter(() =>
      store.set(requiredQueryListenersState.atom, [
        buildQueryListener('record-table'),
      ]),
    );

    await flushAfter(() =>
      store.set(sseEventStreamIdState.atom, 'event-stream-2'),
    );

    expect(
      mockSentMutations.map(({ eventStreamId, queryId }) => ({
        eventStreamId,
        queryId,
      })),
    ).toEqual([
      { eventStreamId: 'event-stream-1', queryId: 'record-table' },
      { eventStreamId: 'event-stream-2', queryId: 'record-table' },
    ]);
  });
});
