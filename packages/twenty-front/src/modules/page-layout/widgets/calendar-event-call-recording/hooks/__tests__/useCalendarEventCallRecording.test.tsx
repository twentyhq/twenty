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

let objectPermissionsResult: {
  canReadObjectRecords: boolean;
  restrictedFields: Record<string, { canRead?: boolean | null }>;
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      id: 'call-recording-object-id',
      labelSingular: 'Call Recording',
      fields: [
        { id: 'status-field-id', name: 'status', label: 'Status' },
        { id: 'transcript-field-id', name: 'transcript', label: 'Transcript' },
        { id: 'summary-field-id', name: 'summary', label: 'Summary' },
        { id: 'video-field-id', name: 'video', label: 'Video' },
        {
          id: 'created-at-field-id',
          name: 'createdAt',
          label: 'Creation date',
        },
      ],
    },
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => objectPermissionsResult,
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
    objectPermissionsResult = {
      canReadObjectRecords: true,
      restrictedFields: {},
    };
  });

  it('queries every call recording field for the current calendar event in arrival order', () => {
    renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

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
          video: true,
          createdAt: true,
        },
        skip: false,
      }),
    );
  });

  it('scopes the SSE query id per widget', () => {
    renderHook(() =>
      useCalendarEventCallRecording({ queryScope: 'call-recording-summary' }),
    );

    expect(mockUseListenToEventsForQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryId: 'call-recording-summary-calendar-event-id',
      }),
    );

    renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(mockUseListenToEventsForQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryId: 'call-recording-transcript-calendar-event-id',
      }),
    );
  });

  it('refetches after the SSE client reconnects', async () => {
    renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

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

    const { result } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(result.current.callRecording).toBeUndefined();
  });

  it('skips the query when there is no target record', () => {
    mockLayoutRenderingContext.targetRecordIdentifier = undefined;

    const { result } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(result.current.callRecording).toBeUndefined();
  });

  it('reports an object restriction and skips the query without read permission', () => {
    objectPermissionsResult = {
      canReadObjectRecords: false,
      restrictedFields: {},
    };

    const { result } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(result.current.restriction).toEqual({
      type: 'object',
      objectName: 'Call Recording',
    });
    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
  });

  it('reports a field restriction only for the scope that reads the field', () => {
    objectPermissionsResult = {
      canReadObjectRecords: true,
      restrictedFields: { 'summary-field-id': { canRead: false } },
    };

    const { result: summaryResult } = renderHook(() =>
      useCalendarEventCallRecording({ queryScope: 'call-recording-summary' }),
    );

    expect(summaryResult.current.restriction).toEqual({
      type: 'field',
      fieldNames: ['Summary'],
    });

    const { result: transcriptResult } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(transcriptResult.current.restriction).toBeUndefined();
  });

  it('reports a video field restriction for the transcript scope only', () => {
    objectPermissionsResult = {
      canReadObjectRecords: true,
      restrictedFields: { 'video-field-id': { canRead: false } },
    };

    const { result: transcriptResult } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(transcriptResult.current.restriction).toEqual({
      type: 'field',
      fieldNames: ['Video'],
    });

    const { result: summaryResult } = renderHook(() =>
      useCalendarEventCallRecording({ queryScope: 'call-recording-summary' }),
    );

    expect(summaryResult.current.restriction).toBeUndefined();
  });

  it('passes loading through and resolves to no recording without records', () => {
    findManyRecordsResult.loading = true;

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(result.current.loading).toBe(true);

    act(() => {
      findManyRecordsResult.loading = false;
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.callRecording).toBeUndefined();
  });

  it('passes query errors through', () => {
    const queryError = new Error('Query failed');
    findManyRecordsResult.error = queryError;

    const { result } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(result.current.error).toBe(queryError);
  });

  it('reacts when a cached in-progress recording completes', () => {
    findManyRecordsResult.records = [
      {
        ...readyCallRecording,
        status: CallRecordingStatus.PROCESSING,
        transcript: { status: 'PENDING' },
      },
    ];

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecording({
        queryScope: 'call-recording-transcript',
      }),
    );

    expect(result.current.callRecording?.status).toBe(
      CallRecordingStatus.PROCESSING,
    );

    act(() => {
      findManyRecordsResult.records = [readyCallRecording];
      rerender();
    });

    expect(result.current.callRecording?.status).toBe(
      CallRecordingStatus.COMPLETED,
    );
    expect(result.current.callRecording?.transcript).toEqual(
      readyCallRecording.transcript,
    );
  });
});
