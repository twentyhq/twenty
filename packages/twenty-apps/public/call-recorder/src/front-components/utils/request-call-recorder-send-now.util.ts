import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { SEND_CALL_RECORDER_NOW_ROUTE_PATH } from 'src/constants/send-call-recorder-now-route-path';
import { type SendCallRecorderNowSkipReason } from 'src/logic-functions/flows/send-call-recorder-now.util';

type SendCallRecorderNowResponse = {
  outcome?: string;
  reason?: string;
  failureReason?: string;
};

type SendCallRecorderNowSnackbar = {
  message: string;
  variant: 'success' | 'info' | 'error';
};

const SKIP_MESSAGE_BY_REASON: Record<SendCallRecorderNowSkipReason, string> = {
  CALENDAR_EVENT_NOT_FOUND: 'Calendar event not found.',
  CALENDAR_BOT_SCHEDULING_DISABLED:
    'Calendar recording is turned off in the Call Recorder settings.',
  EVENT_CANCELED: 'This meeting is canceled.',
  MISSING_CONFERENCE_LINK: 'This meeting has no video link.',
  UNSUPPORTED_MEETING_PLATFORM:
    'The recorder cannot join this meeting platform.',
  EVENT_NOT_UPCOMING: 'This meeting has already ended.',
  EVENT_BEYOND_SCHEDULING_HORIZON:
    'This meeting is too far away to send the recorder.',
  RECORDING_COMPLETED: 'This meeting was already recorded.',
};

const FAILURE_SNACKBAR: SendCallRecorderNowSnackbar = {
  message: 'The recorder could not be sent.',
  variant: 'error',
};

const isSkipReason = (
  reason: string | undefined,
): reason is SendCallRecorderNowSkipReason =>
  reason !== undefined && reason in SKIP_MESSAGE_BY_REASON;

const buildSnackbarForResponse = (
  response: SendCallRecorderNowResponse,
): SendCallRecorderNowSnackbar => {
  switch (response.outcome) {
    case 'sent':
      return {
        message: 'Recorder sent. It joins the meeting within a minute.',
        variant: 'success',
      };
    case 'already-joined':
      return {
        message: 'The recorder is already in this meeting.',
        variant: 'info',
      };
    case 'blocked':
      return {
        message: 'Not enough credits to record this meeting.',
        variant: 'error',
      };
    case 'skipped':
      return {
        message: isSkipReason(response.reason)
          ? SKIP_MESSAGE_BY_REASON[response.reason]
          : 'The recorder cannot join this meeting.',
        variant: 'error',
      };
    case 'single-calendar-event-required':
      return {
        message: 'Select a single meeting to send the recorder to.',
        variant: 'error',
      };
    default:
      return FAILURE_SNACKBAR;
  }
};

export const requestCallRecorderSendNow = async ({
  calendarEventIds,
}: {
  calendarEventIds: string[];
}): Promise<void> => {
  if (calendarEventIds.length === 0) {
    return;
  }

  try {
    const response =
      await new RestApiClient().post<SendCallRecorderNowResponse>(
        `/s${SEND_CALL_RECORDER_NOW_ROUTE_PATH}`,
        { calendarEventIds },
      );

    await enqueueSnackbar(buildSnackbarForResponse(response ?? {}));
  } catch {
    await enqueueSnackbar(FAILURE_SNACKBAR);
  }
};
