import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';
import { act, renderHook } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

const mockUseFindManyRecords = jest.fn();

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

const requiredFields = ['status', 'transcript', 'createdAt'].map((name) => ({
  id: `${name}-field-id`,
  name,
}));

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

describe('useCalendarEventCallRecordingTranscript', () => {
  beforeEach(() => {
    mockUseFindManyRecords.mockClear();
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
    findManyRecordsResult.error = new Error('Query failed');

    const { result } = renderHook(() =>
      useCalendarEventCallRecordingTranscript(),
    );

    expect(result.current.callRecordingTranscriptState).toEqual({
      state: 'QUERY_ERROR',
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
