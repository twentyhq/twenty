import { describe, expect, it } from 'vitest';

import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/map-recall-status-code-to-call-recording-status.util';

describe('mapRecallStatusCodeToCallRecordingStatus', () => {
  it.each([
    ['joining_call', 'JOINING'],
    ['in_waiting_room', 'JOINING'],
    ['in_call_not_recording', 'RECORDING'],
    ['recording_permission_allowed', 'RECORDING'],
    ['in_call_recording', 'RECORDING'],
    ['call_ended', 'PROCESSING'],
    ['analysis_done', 'PROCESSING'],
    ['done', 'PROCESSING'],
    ['fatal', 'FAILED'],
    ['analysis_failed', 'FAILED'],
    ['recording_permission_denied', 'FAILED'],
  ])('maps %s to %s without a sub code', (statusCode, expected) => {
    expect(mapRecallStatusCodeToCallRecordingStatus({ statusCode })).toBe(
      expected,
    );
  });

  it.each([
    ['call_ended', 'meeting_not_started'],
    ['call_ended', 'timeout_exceeded_noone_joined'],
    ['call_ended', 'timeout_exceeded_only_bots_detected_using_participant_names'],
    ['call_ended', 'timeout_exceeded_only_bots_detected_using_participant_events'],
    ['call_ended', 'call_ended_by_platform_waiting_room_timeout'],
    ['call_ended', 'bot_kicked_from_waiting_room'],
    ['fatal', 'meeting_not_started'],
    ['fatal', 'timeout_exceeded_waiting_room'],
  ])(
    'classifies %s with sub code %s as NOT_RECORDED',
    (statusCode, statusSubCode) => {
      expect(
        mapRecallStatusCodeToCallRecordingStatus({ statusCode, statusSubCode }),
      ).toBe('NOT_RECORDED');
    },
  );

  it.each([
    ['call_ended', 'timeout_exceeded_everyone_left', 'PROCESSING'],
    ['call_ended', 'call_ended_by_host', 'PROCESSING'],
    ['fatal', 'bot_errored', 'FAILED'],
    ['fatal', 'meeting_not_found', 'FAILED'],
  ])(
    'keeps %s with sub code %s mapped to %s',
    (statusCode, statusSubCode, expected) => {
      expect(
        mapRecallStatusCodeToCallRecordingStatus({ statusCode, statusSubCode }),
      ).toBe(expected);
    },
  );

  it('returns undefined for unknown status codes', () => {
    expect(
      mapRecallStatusCodeToCallRecordingStatus({
        statusCode: 'some_future_code',
      }),
    ).toBeUndefined();
    expect(
      mapRecallStatusCodeToCallRecordingStatus({ statusCode: undefined }),
    ).toBeUndefined();
  });
});
