import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import {
  FindInstallApplicationJobStatusDocument,
  JobState,
  type JobStatus,
  TriggerInstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID = `install-application.workspace-id.${UNIVERSAL_IDENTIFIER}`;

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const triggerInstallMock = {
  request: {
    query: TriggerInstallApplicationJobDocument,
    variables: { input: { universalIdentifier: UNIVERSAL_IDENTIFIER } },
  },
  result: {
    data: { triggerInstallApplicationJob: { jobId: JOB_ID } },
  },
};

const buildJobStatusMock = (
  findInstallApplicationJobStatus: Partial<JobStatus> | null,
) => ({
  request: {
    query: FindInstallApplicationJobStatusDocument,
    variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
  },
  result: { data: { findInstallApplicationJobStatus } },
});

const buildWrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useInstallMarketplaceApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the triggered job and surfaces a failed job reason', async () => {
    const { result } = renderHook(
      () =>
        useInstallMarketplaceApp({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper([buildJobStatusMock(null), triggerInstallMock]),
      },
    );

    await act(async () => {
      await result.current.install();
    });

    expect(result.current.isInstalling).toBe(true);
    expect(result.current.installProgress).toBeUndefined();

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.ACTIVE,
        attemptsMade: 1,
        progress: 43,
        enqueuedAt: 1,
      });
    });

    expect(result.current.installProgress).toBe(43);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.FAILED,
        attemptsMade: 1,
        failedReason: 'Manifest validation failed',
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isInstalling).toBe(false));
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Manifest validation failed',
    });
  });

  it('reports an installation still running on the server with its progress', async () => {
    const { result } = renderHook(
      () =>
        useInstallMarketplaceApp({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper([
          buildJobStatusMock({
            __typename: 'JobStatus',
            jobId: JOB_ID,
            state: JobState.ACTIVE,
            failedReason: null,
            progress: 57,
          }),
        ]),
      },
    );

    await waitFor(() => expect(result.current.isInstalling).toBe(true));
    expect(result.current.installProgress).toBe(57);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.ACTIVE,
        attemptsMade: 1,
        progress: 86,
        enqueuedAt: 1,
      });
    });

    expect(result.current.installProgress).toBe(86);
  });
});
