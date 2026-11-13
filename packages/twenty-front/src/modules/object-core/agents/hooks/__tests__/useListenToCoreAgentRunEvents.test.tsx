import { act, renderHook } from '@testing-library/react';

import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { useListenToCoreAgentRunEvents } from '@/object-core/agents/hooks/useListenToCoreAgentRunEvents';

const dispatchRunUpdated = (agentId: string) =>
  dispatchMetadataOperationBrowserEvent({
    metadataName: 'agentTurn',
    operation: { type: 'update', updatedRecord: { id: 'run-id', agentId } },
  });

describe('useListenToCoreAgentRunEvents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('collapses a burst of run events into one refetch', () => {
    const onRunsChanged = jest.fn();

    renderHook(() =>
      useListenToCoreAgentRunEvents({ agentId: 'agent-1', onRunsChanged }),
    );

    act(() => {
      dispatchRunUpdated('agent-1');
      dispatchRunUpdated('agent-1');
      dispatchRunUpdated('agent-1');
      jest.advanceTimersByTime(1000);
    });

    expect(onRunsChanged).toHaveBeenCalledTimes(1);
  });

  it('ignores runs of another agent', () => {
    const onRunsChanged = jest.fn();

    renderHook(() =>
      useListenToCoreAgentRunEvents({ agentId: 'agent-1', onRunsChanged }),
    );

    act(() => {
      dispatchRunUpdated('agent-2');
      jest.advanceTimersByTime(5000);
    });

    expect(onRunsChanged).not.toHaveBeenCalled();
  });
});
