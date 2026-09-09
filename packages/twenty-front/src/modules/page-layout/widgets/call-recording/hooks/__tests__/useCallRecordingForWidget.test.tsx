import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useCallRecordingForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForWidget';
import { renderHook } from '@testing-library/react';

let restrictedFields = new Set<string>();

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: jest.fn(() => ({ loading: false, refetch: jest.fn() })),
}));

jest.mock(
  '@/page-layout/widgets/call-recording/hooks/useCallRecordingIdForWidget',
  () => ({
    useCallRecordingIdForWidget: () => ({
      callRecordingId: 'call-recording-id',
      targetKind: 'callRecording',
      loading: false,
      refetchCallRecordingId: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetRestriction',
  () => ({
    useCallRecordingWidgetRestriction: () => ({
      restriction: undefined,
      isFieldRestricted: (fieldName: string) => restrictedFields.has(fieldName),
    }),
  }),
);

const getRequestedFields = () =>
  jest.mocked(useFindOneRecord).mock.calls.at(-1)?.[0].recordGqlFields;

describe('useCallRecordingForWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restrictedFields = new Set();
  });

  it.each([
    { restricted: [], mediaFields: { video: true, audio: true } },
    { restricted: ['video'], mediaFields: { audio: true } },
    { restricted: ['audio'], mediaFields: { video: true } },
    { restricted: ['video', 'audio'], mediaFields: {} },
  ])(
    'omits restricted media fields: $restricted',
    ({ restricted, mediaFields }) => {
      restrictedFields = new Set(restricted);

      renderHook(() => useCallRecordingForWidget({ kind: 'transcript' }));

      expect(getRequestedFields()).toEqual({
        id: true,
        status: true,
        transcript: true,
        ...mediaFields,
      });
    },
  );

  it('does not request media for the summary widget', () => {
    renderHook(() => useCallRecordingForWidget({ kind: 'summary' }));

    expect(getRequestedFields()).toEqual({
      id: true,
      status: true,
      summary: true,
    });
  });

  it('keeps fields stable until media permissions change', () => {
    const { rerender } = renderHook(() =>
      useCallRecordingForWidget({ kind: 'transcript' }),
    );
    const initialFields = getRequestedFields();

    rerender();

    expect(getRequestedFields()).toBe(initialFields);

    restrictedFields = new Set(['video']);
    rerender();

    expect(getRequestedFields()).toEqual({
      id: true,
      status: true,
      transcript: true,
      audio: true,
    });
  });
});
