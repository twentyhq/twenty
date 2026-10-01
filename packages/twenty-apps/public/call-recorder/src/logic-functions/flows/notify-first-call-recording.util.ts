import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv, sendInboxMessage } from 'twenty-sdk/logic-function';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { FIRST_CALL_RECORDING_NOTIFIED_KEY_PREFIX } from 'src/logic-functions/constants/first-call-recording-notified-key-prefix';
import { findCallRecordingForFirstRecordingNotification } from 'src/logic-functions/data/find-call-recording-for-first-recording-notification.util';
import { buildStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export type NotifyFirstCallRecordingResult =
  | { outcome: 'not-completed' }
  | {
      outcome: 'notified';
      notifiedWorkspaceMemberIds: string[];
      failedWorkspaceMemberIds: string[];
    };

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
  const workspaceMemberIds = [
    ...new Set(
      [...callRecording.attendees]
        .sort((first, second) =>
          first.isOrganizer === second.isOrganizer
            ? 0
            : first.isOrganizer
              ? -1
              : 1,
        )
        .map(({ workspaceMemberId }) => workspaceMemberId),
    ),
  ];

  const notifiedWorkspaceMemberIds: string[] = [];
  const failedWorkspaceMemberIds: string[] = [];

  for (const workspaceMemberId of workspaceMemberIds) {
    const notifiedKey = `${FIRST_CALL_RECORDING_NOTIFIED_KEY_PREFIX}${workspaceMemberId}`;

    if ((await kv.get(notifiedKey)) !== null) {
      continue;
    }

    try {
      const { threadId } = await sendInboxMessage({
        workspaceMemberId,
        title: 'Your first call recording is ready',
        text: `Your first call was recorded: **${title}**. The video, transcript and summary are on the meeting page.`,
        context: [
          `Call recording id: ${callRecording.id}`,
          `Calendar event id: ${callRecording.calendarEventId ?? 'unknown'}`,
          `Meeting title: ${title}`,
          'If the member wants to share the recording, read the call recording summary and the calendar event participants, then propose a recap email to the attendees.',
        ].join('\n'),
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
      });

      await kv.set(notifiedKey, threadId);
      notifiedWorkspaceMemberIds.push(workspaceMemberId);
    } catch (error) {
      // A member without access to AI chats cannot receive the message; the
      // others still should, and a redelivery must not message them twice.
      buildStepFailure(
        `first recording notification for workspace member ${workspaceMemberId}`,
        error,
      );
      failedWorkspaceMemberIds.push(workspaceMemberId);
    }
  }

  return {
    outcome: 'notified',
    notifiedWorkspaceMemberIds,
    failedWorkspaceMemberIds,
  };
};
