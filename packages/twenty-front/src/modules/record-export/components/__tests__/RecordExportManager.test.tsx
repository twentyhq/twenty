import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import {
  currentWorkspaceMemberState,
  type CurrentWorkspaceMember,
} from '@/auth/states/currentWorkspaceMemberState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { RecordExportManager } from '@/record-export/components/RecordExportManager';
import { RECORD_EXPORT_UPDATED_EVENT } from '@/record-export/constants/RecordExportUpdatedEvent';
import { type RecordExportSummary } from '@/record-export/types/RecordExportSummary';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  PermissionFlagType,
  RecordExportStatus,
} from '~/generated-metadata/graphql';

const baseExport: RecordExportSummary = {
  id: 'export',
  workspaceId: 'workspace',
  workspaceMemberId: 'member',
  filename: 'person.csv',
  status: RecordExportStatus.PROCESSING,
  processedRecordCount: 1000,
  errorMessage: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:01.000Z',
  expiresAt: '2999-01-01T00:00:00.000Z',
};

describe('RecordExportManager', () => {
  let records: RecordExportSummary[];
  const execute = jest.fn();

  const renderManager = () => {
    const store = createStore();
    store.set(currentWorkspaceState.atom, {
      id: 'workspace',
    } as CurrentWorkspace);
    store.set(currentWorkspaceMemberState.atom, {
      id: 'member',
    } as CurrentWorkspaceMember);
    store.set(currentUserWorkspaceState.atom, {
      permissionFlags: [PermissionFlagType.EXPORT_CSV],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: null,
      isImpersonating: false,
    });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            execute(operation.operationName, operation.variables);
            if (operation.operationName === 'FindManyRecordExports') {
              observer.next({ data: { findManyRecordExports: records } });
            } else if (operation.operationName === 'RetryRecordExport') {
              records = [
                {
                  ...baseExport,
                  id: 'retry',
                  status: RecordExportStatus.QUEUED,
                  updatedAt: '2026-01-01T00:00:03.000Z',
                },
              ];
              observer.next({ data: { retryRecordExport: records[0] } });
            } else {
              observer.error(new Error('Download unavailable'));
            }
            observer.complete();
          }),
      ),
    });
    const rendered = render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <ApolloProvider client={client}>
            <MemoryRouter>
              <SnackBarComponentInstanceContext.Provider
                value={{ instanceId: 'exports' }}
              >
                <SnackBarProvider>
                  <RecordExportManager />
                </SnackBarProvider>
              </SnackBarComponentInstanceContext.Provider>
            </MemoryRouter>
          </ApolloProvider>
        </I18nProvider>
      </Provider>,
    );
    return { ...rendered, store };
  };

  beforeEach(() => {
    localStorage.clear();
    execute.mockClear();
    records = [baseExport];
  });

  it('recovers progress on mount and offers a download after an SSE completion', async () => {
    renderManager();
    expect(
      await screen.findByText('Exporting person.csv: 1000 records'),
    ).toBeInTheDocument();
    act(() =>
      dispatchBrowserEvent(RECORD_EXPORT_UPDATED_EVENT, {
        ...baseExport,
        status: RecordExportStatus.COMPLETED,
        updatedAt: '2026-01-01T00:00:02.000Z',
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Exporting person.csv: 1000 records'),
    ).not.toBeInTheDocument();
  });

  it('recovers missed completion events on reconnect', async () => {
    renderManager();
    await screen.findByText('Exporting person.csv: 1000 records');
    await waitFor(() =>
      expect(execute.mock.calls.length).toBeGreaterThanOrEqual(2),
    );
    records = [
      {
        ...baseExport,
        status: RecordExportStatus.COMPLETED,
        updatedAt: '2026-01-01T00:00:02.000Z',
      },
    ];
    act(() => dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME));
    expect(
      await screen.findByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();
  });

  it('ignores late events from a different workspace or member', async () => {
    records = [];
    renderManager();
    await waitFor(() => expect(execute).toHaveBeenCalled());
    act(() => {
      dispatchBrowserEvent(RECORD_EXPORT_UPDATED_EVENT, {
        ...baseExport,
        workspaceId: 'other',
      });
      dispatchBrowserEvent(RECORD_EXPORT_UPDATED_EVENT, {
        ...baseExport,
        workspaceMemberId: 'other',
      });
    });
    expect(screen.queryByText(/person.csv/)).not.toBeInTheDocument();
  });

  it('shows completion even when the user dismissed the progress notification', async () => {
    const user = userEvent.setup();
    renderManager();
    await screen.findByText('Exporting person.csv: 1000 records');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    act(() =>
      dispatchBrowserEvent(RECORD_EXPORT_UPDATED_EVENT, {
        ...baseExport,
        status: RecordExportStatus.COMPLETED,
        updatedAt: '2026-01-01T00:00:02.000Z',
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();
  });

  it('lets the user retry a failed export', async () => {
    const user = userEvent.setup();
    records = [{ ...baseExport, status: RecordExportStatus.FAILED }];
    renderManager();
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith('RetryRecordExport', {
        id: 'export',
      }),
    );
    expect(await screen.findByText('Preparing person.csv')).toBeInTheDocument();
  });

  it('shows a useful error if a download URL cannot be issued', async () => {
    const user = userEvent.setup();
    records = [{ ...baseExport, status: RecordExportStatus.COMPLETED }];
    renderManager();
    await user.click(await screen.findByRole('button', { name: 'Download' }));
    expect(
      await screen.findByText(
        'The export could not be downloaded. Please try again.',
      ),
    ).toBeInTheDocument();
  });
  it('keeps the newest downloads visible when the notification queue is full', async () => {
    records = [4, 3, 2, 1].map((day) => ({
      ...baseExport,
      id: String(day),
      filename: `export-${day}.csv`,
      createdAt: `2026-01-0${day}T00:00:00.000Z`,
      status: RecordExportStatus.COMPLETED,
    }));
    renderManager();
    expect(
      await screen.findByText('export-4.csv is ready to download'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('export-1.csv is ready to download'),
    ).not.toBeInTheDocument();
  });
});
