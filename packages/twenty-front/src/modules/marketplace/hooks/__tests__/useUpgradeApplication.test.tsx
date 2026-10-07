import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import {
  FindUpgradeApplicationJobStatusDocument,
  JobState,
  type JobStatus,
  TriggerUpgradeApplicationJobDocument,
} from '~/generated-metadata/graphql';

const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const TARGET_VERSION = '2.0.0';
const JOB_ID = `upgrade-application.workspace-id.${UNIVERSAL_IDENTIFIER}-5c98b035-5b09-4550-a4fb-b52056c494d1`;

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const triggerUpgradeMock = {
  request: {
    query: TriggerUpgradeApplicationJobDocument,
    variables: {
      input: {
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        targetVersion: TARGET_VERSION,
      },
    },
  },
  result: {
    data: { triggerUpgradeApplicationJob: { jobId: JOB_ID } },
  },
};

const buildJobStatusMock = (
  findUpgradeApplicationJobStatus: Partial<JobStatus> | null,
) => ({
  request: {
    query: FindUpgradeApplicationJobStatusDocument,
    variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
  },
  result: { data: { findUpgradeApplicationJobStatus } },
});

const buildWrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useUpgradeApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the triggered job and reports its completion', async () => {
    const onCompleted = jest.fn();
    const { result } = renderHook(
      () =>
        useUpgradeApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          onCompleted,
        }),
      {
        wrapper: buildWrapper([buildJobStatusMock(null), triggerUpgradeMock]),
      },
    );

    await act(async () => {
      await result.current.upgrade(TARGET_VERSION);
    });

    expect(result.current.isUpgrading).toBe(true);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.ACTIVE,
        attemptsMade: 1,
        progress: 43,
        enqueuedAt: 1,
      });
    });

    expect(result.current.upgradeProgress).toBe(43);

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.COMPLETED,
        attemptsMade: 1,
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isUpgrading).toBe(false));
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'success',
      children: 'Application upgraded successfully.',
    });
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it('surfaces the failure reason of a failed job without completing', async () => {
    const onCompleted = jest.fn();
    const { result } = renderHook(
      () =>
        useUpgradeApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          onCompleted,
        }),
      {
        wrapper: buildWrapper([buildJobStatusMock(null), triggerUpgradeMock]),
      },
    );

    await act(async () => {
      await result.current.upgrade(TARGET_VERSION);
    });

    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        jobId: JOB_ID,
        state: JobState.FAILED,
        attemptsMade: 1,
        failedReason: 'Upgrade failed for this application.',
        enqueuedAt: 1,
      });
    });

    await waitFor(() => expect(result.current.isUpgrading).toBe(false));
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Upgrade failed for this application.',
    });
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it('reports an upgrade still running on the server with its progress', async () => {
    const { result } = renderHook(
      () =>
        useUpgradeApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      {
        wrapper: buildWrapper([
          buildJobStatusMock({
            __typename: 'JobStatus',
            jobId: JOB_ID,
            state: JobState.ACTIVE,
            failedReason: null,
            progress: 29,
          }),
        ]),
      },
    );

    await waitFor(() => expect(result.current.isUpgrading).toBe(true));
    expect(result.current.upgradeProgress).toBe(29);
  });
});
