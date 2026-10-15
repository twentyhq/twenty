import { InMemoryCache } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { useUninstallApplication } from '@/settings/applications/hooks/useUninstallApplication';
import {
  FindUninstallApplicationJobStatusDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  JobState,
  type JobStatus,
  TriggerUninstallApplicationDocument,
} from '~/generated-metadata/graphql';

const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID = `uninstall-application.workspace-id.${UNIVERSAL_IDENTIFIER}-5c98b035-5b09-4550-a4fb-b52056c494d1`;

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const triggerUninstallMock = {
  request: {
    query: TriggerUninstallApplicationDocument,
    variables: { input: { universalIdentifier: UNIVERSAL_IDENTIFIER } },
  },
  result: {
    data: { triggerUninstallApplication: { jobId: JOB_ID } },
  },
};

const AvailableApplicationAction = () => {
  const { data } = useQuery(FindOneApplicationByUniversalIdentifierDocument, {
    variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    fetchPolicy: 'cache-and-network',
  });

  return (
    <SettingsApplicationActionButton
      installedApplicationId={data?.findOneApplication?.id}
      canInstallMarketplaceApps
    />
  );
};

const buildJobStatusMock = (
  findUninstallApplicationJobStatus: Partial<JobStatus> | null,
) => ({
  request: {
    query: FindUninstallApplicationJobStatusDocument,
    variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
  },
  result: { data: { findUninstallApplicationJobStatus } },
});

const buildWrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useUninstallApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the triggered job and reports its completion', async () => {
    const onCompleted = jest.fn();
    const { result } = renderHook(
      () =>
        useUninstallApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          onCompleted,
        }),
      {
        wrapper: buildWrapper([buildJobStatusMock(null), triggerUninstallMock]),
      },
    );

    await act(async () => {
      await result.current.uninstall();
    });

    expect(result.current.isUninstalling).toBe(true);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.COMPLETED,
        attemptsMade: 1,
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isUninstalling).toBe(false));
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'success',
      children: 'Application successfully uninstalled.',
    });
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it('shows Install when returning to an app after uninstalling it', async () => {
    const cache = new InMemoryCache();

    cache.writeQuery({
      query: FindOneApplicationByUniversalIdentifierDocument,
      variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
      data: {
        findOneApplication: {
          __typename: 'Application',
          id: 'installed-application-id',
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          name: 'Test application',
          logoUrl: null,
          version: '1.0.0',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      },
    });

    const mocks: MockedResponse[] = [
      buildJobStatusMock(null),
      triggerUninstallMock,
      {
        request: {
          query: FindOneApplicationByUniversalIdentifierDocument,
          variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
        },
        result: { errors: [new GraphQLError('Application not found')] },
      },
    ];

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} cache={cache}>
        <MemoryRouter>{children}</MemoryRouter>
      </MockedProvider>
    );

    const { result, unmount } = renderHook(
      () =>
        useUninstallApplication({ universalIdentifier: UNIVERSAL_IDENTIFIER }),
      { wrapper },
    );

    await act(async () => {
      await result.current.uninstall();
    });

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.COMPLETED,
        attemptsMade: 1,
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isUninstalling).toBe(false));
    unmount();

    render(<AvailableApplicationAction />, { wrapper });

    expect(
      await screen.findByRole('button', { name: 'Install' }),
    ).toBeVisible();
  });

  it('surfaces the failure reason of a failed job', async () => {
    const { result } = renderHook(
      () =>
        useUninstallApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper([buildJobStatusMock(null), triggerUninstallMock]),
      },
    );

    await act(async () => {
      await result.current.uninstall();
    });

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.FAILED,
        attemptsMade: 1,
        failedReason: 'This application cannot be uninstalled.',
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isUninstalling).toBe(false));
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'error',
      children: 'This application cannot be uninstalled.',
    });
  });

  it('reports an uninstallation still running on the server with its progress', async () => {
    const { result } = renderHook(
      () =>
        useUninstallApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper([
          buildJobStatusMock({
            __typename: 'JobStatus',
            jobId: JOB_ID,
            state: JobState.ACTIVE,
            failedReason: null,
            progress: 20,
          }),
        ]),
      },
    );

    await waitFor(() => expect(result.current.isUninstalling).toBe(true));
    expect(result.current.uninstallProgress).toBe(20);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.ACTIVE,
        attemptsMade: 1,
        progress: 80,
        enqueuedAt: 1,
      });
    });

    expect(result.current.uninstallProgress).toBe(80);
  });
});
