import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CalendarEventCallRecordingWidgetState } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingWidgetState';
import { getCalendarEventCallRecordingSummaryWidgetState } from '@/page-layout/widgets/call-recording-summary/utils/getCalendarEventCallRecordingSummaryWidgetState';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = (
  summary: { markdown: string | null } | null,
): CalendarEventCallRecordingCandidate => ({
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: [],
  summary,
  createdAt: '2026-08-01T00:00:00.000Z',
});

const getSummaryWidgetState = (
  callRecordingState: CalendarEventCallRecordingWidgetState,
  overrides: {
    isSummaryFieldMetadataMissing?: boolean;
    restrictedSummaryFieldLabel?: string;
  } = {},
) =>
  getCalendarEventCallRecordingSummaryWidgetState({
    callRecordingState,
    isSummaryFieldMetadataMissing:
      overrides.isSummaryFieldMetadataMissing ?? false,
    restrictedSummaryFieldLabel: overrides.restrictedSummaryFieldLabel,
  });

describe('getCalendarEventCallRecordingSummaryWidgetState', () => {
  it.each([
    { state: 'UNSUPPORTED' },
    { state: 'UNAVAILABLE' },
    { state: 'QUERY_ERROR', error: new Error('boom') },
    {
      state: 'FORBIDDEN',
      restriction: { type: 'object', objectName: 'Call Recording' },
    },
  ] as const)('passes $state through from the shared state', (sharedState) => {
    expect(getSummaryWidgetState(sharedState)).toEqual(sharedState);
  });

  it('reports unavailable when the summary field has no metadata', () => {
    expect(
      getSummaryWidgetState(
        {
          state: 'READY',
          entries: [],
          callRecording: createCallRecording({ markdown: '# Notes' }),
        },
        { isSummaryFieldMetadataMissing: true },
      ),
    ).toEqual({ state: 'UNAVAILABLE' });
  });

  it('reports the restricted field when the summary field cannot be read', () => {
    expect(
      getSummaryWidgetState(
        {
          state: 'READY',
          entries: [],
          callRecording: createCallRecording(null),
        },
        { restrictedSummaryFieldLabel: 'Summary' },
      ),
    ).toEqual({
      state: 'FORBIDDEN',
      restriction: { type: 'field', fieldNames: ['Summary'] },
    });
  });

  it('reports the summary field restriction before the query resolves', () => {
    expect(
      getSummaryWidgetState(
        { state: 'LOADING' },
        { restrictedSummaryFieldLabel: 'Summary' },
      ),
    ).toEqual({
      state: 'FORBIDDEN',
      restriction: { type: 'field', fieldNames: ['Summary'] },
    });
  });

  it.each([{ state: 'LOADING' }, { state: 'NO_RECORDING' }] as const)(
    'passes $state through when the summary field is readable',
    (sharedState) => {
      expect(getSummaryWidgetState(sharedState)).toEqual(sharedState);
    },
  );

  it('shows the summary of the recording the transcript tab shows', () => {
    expect(
      getSummaryWidgetState({
        state: 'READY',
        entries: [],
        callRecording: createCallRecording({ markdown: '# Notes' }),
      }),
    ).toEqual({ state: 'READY', markdown: '# Notes' });
  });

  it('shows the summary even while the selected recording is still pending', () => {
    expect(
      getSummaryWidgetState({
        state: 'PENDING',
        callRecording: createCallRecording({ markdown: '# Early notes' }),
      }),
    ).toEqual({ state: 'READY', markdown: '# Early notes' });
  });

  it('treats a whitespace-only summary as missing', () => {
    expect(
      getSummaryWidgetState({
        state: 'READY',
        entries: [],
        callRecording: createCallRecording({ markdown: '   ' }),
      }),
    ).toEqual({ state: 'NO_SUMMARY' });
  });

  it('reports pending when the recording is pending without a summary', () => {
    expect(
      getSummaryWidgetState({
        state: 'PENDING',
        callRecording: createCallRecording(null),
      }),
    ).toEqual({ state: 'PENDING' });
  });

  it('reports failed when the recording failed without a summary', () => {
    expect(
      getSummaryWidgetState({
        state: 'FAILED',
        callRecording: createCallRecording(null),
      }),
    ).toEqual({ state: 'FAILED' });
  });

  it.each(['READY', 'EMPTY', 'MISSING', 'UNRECOGNIZED'] as const)(
    'reports no summary for a %s recording without one',
    (selectionState) => {
      const callRecordingState =
        selectionState === 'READY'
          ? {
              state: selectionState,
              entries: [],
              callRecording: createCallRecording(null),
            }
          : {
              state: selectionState,
              callRecording: createCallRecording(null),
            };

      expect(getSummaryWidgetState(callRecordingState)).toEqual({
        state: 'NO_SUMMARY',
      });
    },
  );
});
