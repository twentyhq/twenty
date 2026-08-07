import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';
import { act, renderHook, waitFor } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

const mockUseFindManyRecords = jest.fn();
const mockFetchMoreRecords = jest.fn();

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

const requiredFields = [
  'status',
  'transcript',
  'startedAt',
  'endedAt',
  'createdAt',
].map((name) => ({ id: `${name}-field-id`, name }));

const mockCallRecordingPermissions: {
  canReadObjectRecords: boolean;
  restrictedFields: Record<string, { canRead: boolean }>;
} = {
  canReadObjectRecords: true,
  restrictedFields: {},
};

let findManyRecordsResult: {
  records: Record<string, unknown>[];
  loading: boolean;
  error: Error | undefined;
  hasNextPage: boolean;
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      id: 'call-recording-object-id',
      fields: requiredFields,
    },
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => mockCallRecordingPermissions,
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (parameters: unknown) => {
    mockUseFindManyRecords(parameters);

    return {
      ...findManyRecordsResult,
      fetchMoreRecords: mockFetchMoreRecords,
      queryIdentifier: 'call-recording-query-identifier',
    };
  },
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => mockLayoutRenderingContext,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => false,
}));

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
  startedAt: '2026-08-07T10:00:00.000Z',
  endedAt: '2026-08-07T10:30:00.000Z',
  createdAt: '2026-08-07T09:55:00.000Z',
};

describe('useCalendarEventCallRecordingTranscript', () => {
  beforeEach(() => {
    mockUseFindManyRecords.mockClear();
    mockFetchMoreRecords.mockReset();
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'calendar-event-id',
      targetObjectNameSingular: 'calendarEvent',
    };
    mockCallRecordingPermissions.canReadObjectRecords = true;
    mockCallRecordingPermissions.restrictedFields = {};
    findManyRecordsResult = {
      records: [],
      loading: false,
      error: undefined,
      hasNextPage: false,
    };
  });

  it('queries every transcript field for the current calendar event', () => {
    renderHook(() => useCalendarEventCallRecordingTranscript());

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'callRecording',
        filter: { calendarEventId: { eq: 'calendar-event-id' } },
        recordGqlFields: {
          id: true,
          status: true,
          transcript: true,
          startedAt: true,
          endedAt: true,
          createdAt: true,
        },
        skip: false,
      }),
    );
  });

  it('loads every page before returning a selected transcript', async () => {
    findManyRecordsResult.hasNextPage = true;
    mockFetchMoreRecords.mockImplementation(async () => {
      findManyRecordsResult.records = [readyCallRecording];
      findManyRecordsResult.hasNextPage = false;

      return { data: {} };
    });

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'LOADING',
      loadingPhase: 'ADDITIONAL_PAGE',
    });

    await waitFor(() => expect(mockFetchMoreRecords).toHaveBeenCalledTimes(1));

    rerender();

    expect(result.current.callRecordingTranscriptState.state).toBe('READY');
  });

  it('returns permission denied when the object cannot be read', () => {
    mockCallRecordingPermissions.canReadObjectRecords = false;

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'FORBIDDEN',
    });
    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
  });

  it('returns permission denied when a required field cannot be read', () => {
    mockCallRecordingPermissions.restrictedFields = {
      'transcript-field-id': { canRead: false },
    };

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'FORBIDDEN',
    });
  });

  it('fails safely outside a calendar event record page', () => {
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'person-id',
      targetObjectNameSingular: 'person',
    };

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'UNSUPPORTED',
    });
  });

  it('fails safely when there is no target record', () => {
    mockLayoutRenderingContext.targetRecordIdentifier = undefined;

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'UNSUPPORTED',
    });
  });

  it('distinguishes initial loading from no related recordings', () => {
    findManyRecordsResult.loading = true;

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'LOADING',
      loadingPhase: 'INITIAL',
    });

    act(() => {
      findManyRecordsResult.loading = false;
      rerender();
    });

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'NO_RECORDING',
    });
  });

  it('maps query failures without showing a no-recording state', () => {
    findManyRecordsResult.error = new Error('Query failed');

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'QUERY_ERROR',
    });
  });

  it('maps pagination failures without showing a partial selection', async () => {
    findManyRecordsResult.records = [readyCallRecording];
    findManyRecordsResult.hasNextPage = true;
    mockFetchMoreRecords.mockResolvedValue({
      error: new Error('Next page failed'),
    });

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    await waitFor(() => {
      expect(result.current.callRecordingTranscriptState).toEqual({
        state: 'QUERY_ERROR',
      });
    });
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
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState.state).toBe('PENDING');

    act(() => {
      findManyRecordsResult.records = [readyCallRecording];
      rerender();
    });

    expect(result.current.callRecordingTranscriptState.state).toBe('READY');
  });
});
