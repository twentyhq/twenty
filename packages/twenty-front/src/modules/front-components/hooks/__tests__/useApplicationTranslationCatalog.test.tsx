import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { type AppLocale } from 'twenty-shared/translations';

import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useApplicationTranslationCatalog } from '@/front-components/hooks/useApplicationTranslationCatalog';

let workspaceId = 'workspace';
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: workspaceId }),
}));

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
  workspaceId = 'workspace';
});

it('deduplicates 100 consumers and refetches after an invalidation during the initial request', async () => {
  const client = createClient();
  const { unmount } = render(
    <ApolloProvider client={client}>
      {Array.from({ length: 100 }, (_, index) => (
        <Reader key={index} />
      ))}
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  act(() => invalidate());
  await act(async () => pending[0].resolve({ label: 'Old' }));
  await waitFor(() => expect(pending).toHaveLength(2));
  await act(async () => pending[1].resolve({ label: 'New' }));
  await waitFor(() => expect(screen.getAllByText('New')).toHaveLength(100));
  expect(pending).toHaveLength(2);
  act(() => invalidate('other-app'));
  expect(pending).toHaveLength(2);
  unmount();
  client.stop();
});

it('loads the active locale, falls back on failure, and clears deleted messages', async () => {
  const client = createClient();
  const { rerender, unmount } = render(
    <ApolloProvider client={client}>
      <Reader />
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  await act(async () => pending[0].reject());
  await waitFor(() => expect(screen.getByText('Source')).toBeTruthy());
  rerender(
    <ApolloProvider client={client}>
      <Reader locale="de-DE" />
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(2));
  expect(pending[1].variables).toEqual({
    applicationId: 'app',
    locale: 'de-DE',
  });
  await act(async () => pending[1].resolve({ label: 'Deutsch' }));
  await waitFor(() => expect(screen.getByText('Deutsch')).toBeTruthy());
  act(() => invalidate());
  await waitFor(() => expect(pending).toHaveLength(3));
  await act(async () => pending[2].resolve({}));
  await waitFor(() => expect(screen.getByText('Source')).toBeTruthy());
  rerender(
    <ApolloProvider client={client}>
      <Reader locale="en" />
    </ApolloProvider>,
  );
  expect(pending).toHaveLength(3);
  unmount();
  client.stop();
});

it('refreshes after reconnect and queues repeated invalidations without overlapping requests', async () => {
  const client = createClient();
  const { unmount } = render(
    <ApolloProvider client={client}>
      <Reader />
    </ApolloProvider>,
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
    <ApolloProvider client={client}>
      <Reader />
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  workspaceId = 'another-workspace';
  rerender(
    <ApolloProvider client={client}>
      <Reader />
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(2));
  await act(async () => pending[1].resolve({ label: 'Current workspace' }));
  await act(async () => pending[0].resolve({ label: 'Previous workspace' }));
  expect(screen.getByText('Current workspace')).toBeTruthy();
  expect(screen.queryByText('Previous workspace')).toBeNull();
  unmount();
  client.stop();
});

it('retains a working catalog when a refresh fails and clears it only after a successful empty response', async () => {
  const client = createClient();
  const { unmount } = render(
    <ApolloProvider client={client}>
      <Reader />
    </ApolloProvider>,
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  await act(async () => pending[0].resolve({ label: 'Bonjour' }));
  act(() => invalidate());
  await waitFor(() => expect(pending).toHaveLength(2));
  await act(async () => pending[1].reject());
  expect(screen.getByText('Bonjour')).toBeTruthy();
  act(() => invalidate());
  await waitFor(() => expect(pending).toHaveLength(3));
  await act(async () => pending[2].resolve({}));
  expect(screen.getByText('Source')).toBeTruthy();
  unmount();
  client.stop();
});
