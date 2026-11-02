import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';
import { DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS } from 'src/logic-functions/constants/default-call-recorder-record-my-meetings';

export const isRecordingRequestedByAttendee = ({
  participantWorkspaceMemberIds,
  hasExternalAttendee,
  recordMyMeetingsChoices,
}: {
  participantWorkspaceMemberIds: string[];
  hasExternalAttendee: boolean;
  recordMyMeetingsChoices: Map<string, CallRecorderRecordMyMeetingsChoice>;
}): boolean =>
  participantWorkspaceMemberIds.length === 0 ||
  participantWorkspaceMemberIds.some((workspaceMemberId) =>
    isMeetingWantedByAttendee({
      choice:
        recordMyMeetingsChoices.get(workspaceMemberId) ??
        DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS,
      hasExternalAttendee,
    }),
  );

const isMeetingWantedByAttendee = ({
  choice,
  hasExternalAttendee,
}: {
  choice: CallRecorderRecordMyMeetingsChoice;
  hasExternalAttendee: boolean;
}): boolean =>
  choice === CallRecorderRecordMyMeetingsChoice.ALL_MEETINGS ||
  (choice === CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS &&
    hasExternalAttendee);
