import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { type AppLocale } from 'twenty-shared/translations';

import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useApplicationTranslationCatalog } from '@/front-components/hooks/useApplicationTranslationCatalog';

const workspaceStore = createStore();

const pending: Array<{
  variables: Record<string, unknown>;
  resolve: (messages: Record<string, string>) => void;
  reject: () => void;
}> = [];
const createClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          pending.push({
            variables: operation.variables,
            resolve: (messages) => {
              observer.next({
                data: { applicationTranslationCatalog: messages },
              });
              observer.complete();
            },
            reject: () => observer.error(new Error('Unavailable')),
          });
        }),
    ),
  });
const Reader = ({
  applicationId = 'app',
  locale = 'fr-FR',
}: {
  applicationId?: string;
  locale?: AppLocale;
}) => {
  const { translationCatalog, isWaitingForInitialCatalog } =
    useApplicationTranslationCatalog({ applicationId, locale });
  return (
    <span>
      {isWaitingForInitialCatalog
        ? 'Loading'
        : (translationCatalog.label ?? 'Source')}
    </span>
  );
};
const invalidate = (applicationId = 'app') =>
  window.dispatchEvent(
    new CustomEvent(METADATA_OPERATION_BROWSER_EVENT_NAME, {
      detail: {
        metadataName: 'application',
        operation: {
          type: 'update',
          updatedRecord: { id: applicationId, translationCatalogUpdated: true },
        },
      },
    }),
  );
beforeEach(() => {
  pending.length = 0;
  workspaceStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
});

it('refreshes after reconnect and queues repeated invalidations without overlapping requests', async () => {
  const client = createClient();
  const { unmount } = render(
    <JotaiProvider store={workspaceStore}>
      <ApolloProvider client={client}>
        <Reader />
      </ApolloProvider>
    </JotaiProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  await act(async () => pending[0].resolve({ label: 'Initial' }));
  act(() =>
    window.dispatchEvent(new CustomEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME)),
  );
  await waitFor(() => expect(pending).toHaveLength(2));
  act(() => {
    invalidate();
    invalidate();
    invalidate();
  });
  expect(pending).toHaveLength(2);
  await act(async () => pending[1].resolve({ label: 'Older' }));
  await waitFor(() => expect(pending).toHaveLength(3));
  await act(async () => pending[2].resolve({ label: 'Current' }));
  expect(screen.getByText('Current')).toBeTruthy();
  expect(pending).toHaveLength(3);
  unmount();
  client.stop();
});

it('isolates workspaces even when an old request finishes after switching', async () => {
  const client = createClient();
  const { rerender, unmount } = render(
    <JotaiProvider store={workspaceStore}>
      <ApolloProvider client={client}>
        <Reader />
      </ApolloProvider>
    </JotaiProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  act(() =>
    workspaceStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      id: 'another-workspace',
    }),
  );
  rerender(
    <JotaiProvider store={workspaceStore}>
      <ApolloProvider client={client}>
        <Reader />
      </ApolloProvider>
    </JotaiProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(2));
  await act(async () => pending[1].resolve({ label: 'Current workspace' }));
  await act(async () => pending[0].resolve({ label: 'Previous workspace' }));
  expect(screen.getByText('Current workspace')).toBeTruthy();
  expect(screen.queryByText('Previous workspace')).toBeNull();
  unmount();
  client.stop();
});

const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
};
const StatefulReader = ({ locale }: { locale: AppLocale }) => {
  const { isWaitingForInitialCatalog } = useApplicationTranslationCatalog({
    applicationId: 'app',
    locale,
  });
  return isWaitingForInitialCatalog ? <span>Loading</span> : <Counter />;
};

it('keeps mounted component state while a new locale catalog loads', async () => {
  const user = userEvent.setup();
  const client = createClient();
  const { rerender, unmount } = render(
    <JotaiProvider store={workspaceStore}>
      <ApolloProvider client={client}>
        <StatefulReader locale="fr-FR" />
      </ApolloProvider>
    </JotaiProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  await act(async () => pending[0].resolve({ label: 'Bonjour' }));
  await user.click(screen.getByRole('button', { name: 'Count 0' }));
  rerender(
    <JotaiProvider store={workspaceStore}>
      <ApolloProvider client={client}>
        <StatefulReader locale="de-DE" />
      </ApolloProvider>
    </JotaiProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(2));
  expect(screen.getByRole('button', { name: 'Count 1' })).toBeTruthy();
  await act(async () => pending[1].resolve({ label: 'Hallo' }));
  expect(screen.getByRole('button', { name: 'Count 1' })).toBeTruthy();
  unmount();
  client.stop();
});
