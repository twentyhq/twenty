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
  TriggerUninstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID = `uninstall-application.workspace-id.${UNIVERSAL_IDENTIFIER}-5c98b035-5b09-4550-a4fb-b52056c494d1`;

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const triggerUninstallMock = {
  request: {
    query: TriggerUninstallApplicationJobDocument,
    variables: { input: { universalIdentifier: UNIVERSAL_IDENTIFIER } },
  },
  result: {
    data: { triggerUninstallApplicationJob: { jobId: JOB_ID } },
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
      variant: 'success',
      children: 'Application successfully uninstalled.',
    });
    expect(onCompleted).toHaveBeenCalledTimes(1);
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
      variant: 'error',
      children: 'This application cannot be uninstalled.',
    });
  });

  it('reports an uninstallation still running on the server', async () => {
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
          }),
        ]),
      },
    );

    await waitFor(() => expect(result.current.isUninstalling).toBe(true));
  });
});
