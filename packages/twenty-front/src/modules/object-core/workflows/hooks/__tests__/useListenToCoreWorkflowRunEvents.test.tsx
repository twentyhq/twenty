import { act, renderHook } from '@testing-library/react';

import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useListenToCoreWorkflowRunEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowRunEvents';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
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

const runDeletedEvent: ObjectRecordOperationBrowserEventDetail = {
  objectMetadataItem: getMockObjectMetadataItemOrThrow('workflowRun'),
  operation: { type: 'delete-one', deletedRecordId: 'workflow-run-id' },
};

const renderRunEventsListener = ({
  coreWorkflowIds = ['workflow-id'],
  onRunsChanged = jest.fn(),
}: {
  coreWorkflowIds?: string[];
  onRunsChanged?: () => void;
} = {}) =>
  renderHook(() =>
    useListenToCoreWorkflowRunEvents({
      coreWorkflowIds,
      queryId: 'query-id',
      onRunsChanged,
    }),
  );

describe('useListenToCoreWorkflowRunEvents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(useListenToEventsForQuery).mockClear();
    browserEventHandlers.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onRunsChanged once, without the event payload, after a burst of run events', () => {
    const onRunsChanged = jest.fn();

    renderRunEventsListener({ onRunsChanged });

    act(() => {
      browserEventHandlers.at(-1)?.(runDeletedEvent);
      browserEventHandlers.at(-1)?.(runDeletedEvent);
      jest.runAllTimers();
    });

    expect(onRunsChanged).toHaveBeenCalledTimes(1);
    expect(onRunsChanged).toHaveBeenCalledWith();
  });

  it('still refreshes while run events keep coming', () => {
    const onRunsChanged = jest.fn();

    renderRunEventsListener({ onRunsChanged });

    act(() => {
      for (let elapsedInMs = 0; elapsedInMs < 6000; elapsedInMs += 500) {
        browserEventHandlers.at(-1)?.(runDeletedEvent);
        jest.advanceTimersByTime(500);
      }
    });

    expect(onRunsChanged).toHaveBeenCalled();
  });

  it('subscribes to the runs of the listed workflows only', () => {
    renderRunEventsListener({ coreWorkflowIds: ['workflow-a', 'workflow-b'] });

    expect(useListenToEventsForQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        skip: false,
        operationSignature: expect.objectContaining({
          variables: {
            filter: { coreWorkflowId: { in: ['workflow-a', 'workflow-b'] } },
          },
        }),
      }),
    );
  });

  it('does not subscribe when no workflow is listed', () => {
    renderRunEventsListener({ coreWorkflowIds: [] });

    expect(useListenToEventsForQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: true }),
    );
  });
});
