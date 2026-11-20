import { InMemoryCache } from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useUninstallApplication } from '@/settings/applications/hooks/useUninstallApplication';
import {
  FindUninstallApplicationJobStatusDocument,
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
  ({
    mocks,
    cache = new InMemoryCache(),
  }: {
    mocks: MockedResponse[];
    cache?: InMemoryCache;
  }) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} cache={cache}>
      {children}
    </MockedProvider>
  );

describe('useUninstallApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the triggered job and reports its completion', async () => {
    const onCompleted = jest.fn();
    const cache = new InMemoryCache();
    const cachedApplicationField = `findOneApplication({"universalIdentifier":"${UNIVERSAL_IDENTIFIER}"})`;

    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        [cachedApplicationField]: { __ref: 'Application:application-id' },
      },
      'Application:application-id': {
        __typename: 'Application',
        id: 'application-id',
      },
    });

    const { result } = renderHook(
      () =>
        useUninstallApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          onCompleted,
        }),
      {
        wrapper: buildWrapper({
          mocks: [buildJobStatusMock(null), triggerUninstallMock],
          cache,
        }),
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
    expect(cache.extract().ROOT_QUERY).not.toHaveProperty(
      cachedApplicationField,
    );
  });

  it('surfaces the failure reason of a failed job', async () => {
    const { result } = renderHook(
      () =>
        useUninstallApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper({
          mocks: [buildJobStatusMock(null), triggerUninstallMock],
        }),
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
        wrapper: buildWrapper({
          mocks: [
            buildJobStatusMock({
              __typename: 'JobStatus',
              jobId: JOB_ID,
              state: JobState.ACTIVE,
              failedReason: null,
              progress: 20,
            }),
          ],
        }),
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
