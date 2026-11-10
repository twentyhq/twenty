import { act, renderHook } from '@testing-library/react';

import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';

const browserEventHandlers: ((detail: unknown) => void)[] = [];

jest.mock(
  '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent',
  () => ({
    useListenToObjectRecordOperationBrowserEvent: ({
      onObjectRecordOperationBrowserEvent,
    }: {
      onObjectRecordOperationBrowserEvent: (detail: unknown) => void;
    }) => {
      browserEventHandlers.push(onObjectRecordOperationBrowserEvent);
    },
  }),
);

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'workflow-run-object-metadata-id' },
  }),
}));

describe('useListenToCoreWorkflowRunEvents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    browserEventHandlers.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onRunsChanged once, without the event payload, after a burst of run events', () => {
    const onRunsChanged = jest.fn();

    renderHook(() =>
      useListenToCoreWorkflowRunEvents({
        coreWorkflowId: 'workflow-id',
        queryId: 'query-id',
        onRunsChanged,
      }),
    );

    const handleBrowserEvent = browserEventHandlers.at(-1);

    act(() => {
      handleBrowserEvent?.({ operation: { type: 'update-one' } });
      handleBrowserEvent?.({ operation: { type: 'update-one' } });
      jest.runAllTimers();
    });

    expect(onRunsChanged).toHaveBeenCalledTimes(1);
    expect(onRunsChanged).toHaveBeenCalledWith();
  });
});
