import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { sendInboxMessage } from 'twenty-sdk/logic-function';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { findCallRecordingForFirstRecordingNotification } from 'src/logic-functions/data/find-call-recording-for-first-recording-notification.util';
import { buildStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

// The same keys for every recording make the server keep one message per
// member, so only the first recording reaches them.
const FIRST_CALL_RECORDING_KEY = 'first-call-recording';

export type NotifyFirstCallRecordingResult =
  | { outcome: 'not-completed' }
  | { outcome: 'notified'; notifiedWorkspaceMemberIds: string[] };

export const notifyFirstCallRecording = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<NotifyFirstCallRecordingResult> => {
  const callRecording = await findCallRecordingForFirstRecordingNotification(
    client,
    { id: callRecordingId },
  );

  if (callRecording?.status !== CallRecordingStatus.COMPLETED) {
    return { outcome: 'not-completed' };
  }

  const title = callRecording.title ?? 'your meeting';
  // A record chip links the meeting for the member and gives the assistant
  // its id when they ask for a recap. Brackets would end the chip early.
  const meeting = isUndefined(callRecording.calendarEventId)
    ? `**${title}**`
    : `[[record:calendarEvent:${callRecording.calendarEventId}:${title.replace(/[[\]\n]/g, ' ')}]]`;
  const workspaceMemberIds = [
    ...new Set(
      [...callRecording.attendees]
        .sort(
          (first, second) =>
            Number(second.isOrganizer) - Number(first.isOrganizer),
        )
        .map(({ workspaceMemberId }) => workspaceMemberId),
    ),
  ];

  const notifiedWorkspaceMemberIds: string[] = [];
  const failedWorkspaceMemberIds: string[] = [];

  for (const workspaceMemberId of workspaceMemberIds) {
    try {
      await sendInboxMessage({
        workspaceMemberId,
        threadKey: FIRST_CALL_RECORDING_KEY,
        idempotencyKey: FIRST_CALL_RECORDING_KEY,
        title: 'Your first call recording is ready',
        text: `Your first call was recorded: ${meeting}. The video, transcript and summary are on the meeting page.`,
        request: {
          toolName: 'ask_questions',
          input: {
            questions: [
              {
                header: 'Share',
                question: 'Do you want to share it with the other attendees?',
                options: [
                  {
                    label: 'Draft a recap email',
                    description:
                      'An email to the attendees with the meeting summary, for you to review before it is sent',
                    isRecommended: true,
                  },
                  { label: 'Not now' },
                ],
              },
            ],
          },
        },
      });

      notifiedWorkspaceMemberIds.push(workspaceMemberId);
    } catch (error) {
      buildStepFailure(
        `first recording notification for workspace member ${workspaceMemberId}`,
        error,
      );
      failedWorkspaceMemberIds.push(workspaceMemberId);
    }
  }

  // Sends are idempotent, so a redelivery only completes the failed ones.
  if (failedWorkspaceMemberIds.length > 0) {
    throw new Error(
      `Could not notify workspace members ${failedWorkspaceMemberIds.join(', ')}`,
    );
  }

  return { outcome: 'notified', notifiedWorkspaceMemberIds };
};
