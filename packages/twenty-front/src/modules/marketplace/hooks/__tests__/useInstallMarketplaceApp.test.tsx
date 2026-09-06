import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import {
  JobState,
  type JobStatus,
  TriggerInstallApplicationJobDocument,
} from '~/generated-metadata/graphql';

const JOB_ID = '5c98b035-5b09-4550-a4fb-b52056c494d1';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('uuid', () => ({
  v4: () => '5c98b035-5b09-4550-a4fb-b52056c494d1',
}));
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    enqueueSuccessSnackBar: jest.fn(),
  }),
}));

const mocks = [
  {
    request: {
      query: TriggerInstallApplicationJobDocument,
      variables: {
        input: {
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          jobId: JOB_ID,
        },
      },
    },
    result: {
      data: { triggerInstallApplicationJob: { jobId: JOB_ID } },
    },
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks}>{children}</MockedProvider>
);

describe('useInstallMarketplaceApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks a caller-provided job id and surfaces a failed job reason', async () => {
    const { result } = renderHook(() => useInstallMarketplaceApp(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.install({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
      });
    });

    expect(result.current.isInstalling).toBe(true);

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
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Manifest validation failed',
    });
  });
});
