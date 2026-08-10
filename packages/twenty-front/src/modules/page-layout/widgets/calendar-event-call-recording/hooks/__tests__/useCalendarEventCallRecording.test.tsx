import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { act, renderHook } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

const mockUseFindManyRecords = jest.fn();
const mockUseListenToEventsForQuery = jest.fn();

const mockLayoutRenderingContext: {
  targetRecordIdentifier?: {
    id: string;
    targetObjectNameSingular: string;
  };
} = {
  targetRecordIdentifier: {
    id: 'calendar-event-id',
    targetObjectNameSingular: 'calendarEvent',
  },
};

let findManyRecordsResult: {
  records: Record<string, unknown>[];
  loading: boolean;
  error: Error | undefined;
  refetch: jest.Mock;
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      id: 'call-recording-object-id',
    },
  }),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (parameters: unknown) => {
    mockUseFindManyRecords(parameters);

    return findManyRecordsResult;
  },
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => mockLayoutRenderingContext,
}));

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: (parameters: unknown) => {
    mockUseListenToEventsForQuery(parameters);
  },
}));

jest.mock(
  '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent',
  () => ({
    useListenToObjectRecordOperationBrowserEvent: jest.fn(),
  }),
);

const readyCallRecording = {
  __typename: 'CallRecording',
  id: 'ready-call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: [
    {
      participant: { name: 'Ada' },
      words: [{ text: 'Hello', start_timestamp: { relative: 0 } }],
    },
  ],
  summary: null,
  createdAt: '2026-08-07T09:55:00.000Z',
};

describe('useCalendarEventCallRecording', () => {
  beforeEach(() => {
    mockUseFindManyRecords.mockClear();
    mockUseListenToEventsForQuery.mockClear();
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'calendar-event-id',
      targetObjectNameSingular: 'calendarEvent',
    };
    findManyRecordsResult = {
      records: [],
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    };
  });

  it('queries every call recording field for the current calendar event in arrival order', () => {
    renderHook(() => useCalendarEventCallRecording());

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'callRecording',
        filter: { calendarEventId: { eq: 'calendar-event-id' } },
        orderBy: [{ createdAt: 'AscNullsLast' }, { id: 'AscNullsFirst' }],
        recordGqlFields: {
          id: true,
          status: true,
          transcript: true,
          summary: true,
          createdAt: true,
        },
        skip: false,
      }),
    );
  });

  it('refetches after the SSE client reconnects', async () => {
    renderHook(() => useCalendarEventCallRecording());

    const { onSseReconnected } = mockUseListenToEventsForQuery.mock
      .calls[0][0] as {
      onSseReconnected: () => Promise<void>;
    };

    await act(async () => {
      await onSseReconnected();
    });

    expect(findManyRecordsResult.refetch).toHaveBeenCalledTimes(1);
  });

  it('skips the query outside a calendar event record page', () => {
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'person-id',
      targetObjectNameSingular: 'person',
    };

    const { result } = renderHook(() => useCalendarEventCallRecording());

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(result.current.callRecordingSelection).toBeUndefined();
  });

  it('skips the query when there is no target record', () => {
    mockLayoutRenderingContext.targetRecordIdentifier = undefined;

    const { result } = renderHook(() => useCalendarEventCallRecording());

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(result.current.callRecordingSelection).toBeUndefined();
  });

  it('passes loading through and resolves to no selection without recordings', () => {
    findManyRecordsResult.loading = true;

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecording(),
    );

    expect(result.current.loading).toBe(true);

    act(() => {
      findManyRecordsResult.loading = false;
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.callRecordingSelection).toBeUndefined();
  });

  it('passes query errors through', () => {
    const queryError = new Error('Query failed');
    findManyRecordsResult.error = queryError;

    const { result } = renderHook(() => useCalendarEventCallRecording());

    expect(result.current.error).toBe(queryError);
  });

  it('reacts when a cached pending recording receives a transcript', () => {
    findManyRecordsResult.records = [
      {
        ...readyCallRecording,
        status: CallRecordingStatus.PROCESSING,
        transcript: { status: 'PENDING' },
      },
    ];

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecording(),
    );

    expect(
      result.current.callRecordingSelection?.transcriptEntries,
    ).toBeUndefined();

    act(() => {
      findManyRecordsResult.records = [readyCallRecording];
      rerender();
    });

    expect(result.current.callRecordingSelection?.transcriptEntries).toEqual([
      expect.objectContaining({ speakerName: 'Ada', text: 'Hello' }),
    ]);
  });
});
