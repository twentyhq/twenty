import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';
import { act, renderHook } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

const mockUseFindManyRecords = jest.fn();
const mockRefetch = jest.fn();

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
  { id: 'status-field-id', name: 'status', label: 'Status' },
  { id: 'transcript-field-id', name: 'transcript', label: 'Transcript' },
  { id: 'createdAt-field-id', name: 'createdAt', label: 'Creation date' },
];

const mockCallRecordingObjectMetadataItem: {
  id: string;
  labelSingular: string;
  fields: { id: string; name: string; label: string }[];
} = {
  id: 'call-recording-object-id',
  labelSingular: 'Call Recording',
  fields: requiredFields,
};

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
  refetch: jest.Mock;
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: mockCallRecordingObjectMetadataItem,
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => mockCallRecordingPermissions,
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
  createdAt: '2026-08-07T09:55:00.000Z',
};

const pendingCallRecording = {
  ...readyCallRecording,
  status: CallRecordingStatus.PROCESSING,
  transcript: { status: 'PENDING' },
};

describe('useCalendarEventCallRecordingTranscript', () => {
  beforeEach(() => {
    mockUseFindManyRecords.mockClear();
    mockRefetch.mockClear();
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'calendar-event-id',
      targetObjectNameSingular: 'calendarEvent',
    };
    mockCallRecordingObjectMetadataItem.fields = requiredFields;
    mockCallRecordingPermissions.canReadObjectRecords = true;
    mockCallRecordingPermissions.restrictedFields = {};
    findManyRecordsResult = {
      records: [],
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    };
  });

  it('queries every transcript field for the current calendar event in arrival order', () => {
    renderHook(() => useCalendarEventCallRecordingTranscript());

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'callRecording',
        filter: { calendarEventId: { eq: 'calendar-event-id' } },
        orderBy: [{ createdAt: 'AscNullsLast' }, { id: 'AscNullsFirst' }],
        recordGqlFields: {
          id: true,
          status: true,
          transcript: true,
          createdAt: true,
        },
        skip: false,
      }),
    );
  });

  it('returns permission denied when the object cannot be read', () => {
    mockCallRecordingPermissions.canReadObjectRecords = false;

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'FORBIDDEN',
      restriction: { type: 'object', objectName: 'Call Recording' },
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
      restriction: {
        type: 'field',
        objectName: 'Call Recording',
        fieldNames: ['Transcript'],
      },
    });
  });

  it('reports unavailability instead of a permission denial when a required field is missing', () => {
    mockCallRecordingObjectMetadataItem.fields = requiredFields.filter(
      (field) => field.name !== 'transcript',
    );

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'UNAVAILABLE',
    });
    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
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

  it('distinguishes loading from no related recordings', () => {
    findManyRecordsResult.loading = true;

    const { result, rerender } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'LOADING',
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
    const queryError = new Error('Query failed');
    findManyRecordsResult.error = queryError;

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'QUERY_ERROR',
      error: queryError,
    });
  });

  it('reacts when a cached pending recording receives a transcript', () => {
    findManyRecordsResult.records = [pendingCallRecording];

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

  it('polls while the selected transcript is pending and stops once it is ready', () => {
    jest.useFakeTimers();

    try {
      findManyRecordsResult.records = [pendingCallRecording];

      const { rerender } = renderHook(() =>
        useCalendarEventCallRecordingTranscript(),
      );

      act(() => {
        jest.advanceTimersByTime(30_000);
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);

      act(() => {
        findManyRecordsResult.records = [readyCallRecording];
        rerender();
      });

      act(() => {
        jest.advanceTimersByTime(30_000);
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
