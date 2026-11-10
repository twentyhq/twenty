import { act, renderHook } from '@testing-library/react';

import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type BrowserEventHandler = (
  detail: ObjectRecordOperationBrowserEventDetail,
) => void;

const browserEventHandlers: BrowserEventHandler[] = [];

jest.mock(
  '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent',
  () => ({
    useListenToObjectRecordOperationBrowserEvent: ({
      onObjectRecordOperationBrowserEvent,
    }: {
      onObjectRecordOperationBrowserEvent: BrowserEventHandler;
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
    const runDeletedEvent: ObjectRecordOperationBrowserEventDetail = {
      objectMetadataItem: getMockObjectMetadataItemOrThrow('workflowRun'),
      operation: { type: 'delete-one', deletedRecordId: 'workflow-run-id' },
    };

    act(() => {
      handleBrowserEvent?.(runDeletedEvent);
      handleBrowserEvent?.(runDeletedEvent);
      jest.runAllTimers();
    });

    expect(onRunsChanged).toHaveBeenCalledTimes(1);
    expect(onRunsChanged).toHaveBeenCalledWith();
  });
});
