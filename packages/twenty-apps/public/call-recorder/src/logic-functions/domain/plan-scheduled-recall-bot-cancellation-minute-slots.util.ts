import { isUndefined } from '@sniptt/guards';

import { MAXIMUM_PLANNED_SCHEDULED_RECALL_BOT_CANCELLATIONS } from 'src/logic-functions/constants/maximum-planned-scheduled-recall-bot-cancellations';
import { SCHEDULED_RECALL_BOT_CANCELLATIONS_PER_MINUTE } from 'src/logic-functions/constants/scheduled-recall-bot-cancellation';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { type CanceledCallRecordingBot } from 'src/logic-functions/types/canceled-call-recording-bot.type';
import { type ScheduledRecallBotCancellationPlan } from 'src/logic-functions/types/scheduled-recall-bot-cancellation-plan.type';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

type RankedCanceledCallRecordingBot = {
  canceledCallRecordingBot: CanceledCallRecordingBot;
  meetingRank: number;
  meetingStartTime: number;
};

const UPCOMING_OR_IN_PROGRESS_MEETING_RANK = 0;
const UNKNOWN_MEETING_START_RANK = 1;
const ENDED_MEETING_RANK = 2;

const rankCanceledCallRecordingBot = ({
  canceledCallRecordingBot,
  now,
}: {
  canceledCallRecordingBot: CanceledCallRecordingBot;
  now: Date;
}): RankedCanceledCallRecordingBot => {
  const { meetingStartsAt, meetingEndsAt } = canceledCallRecordingBot;
  const meetingStartTime = isUndefined(meetingStartsAt)
    ? Number.NaN
    : new Date(meetingStartsAt).getTime();

  if (Number.isNaN(meetingStartTime)) {
    return {
      canceledCallRecordingBot,
      meetingRank: UNKNOWN_MEETING_START_RANK,
      meetingStartTime: 0,
    };
  }

  return {
    canceledCallRecordingBot,
    meetingRank: hasMeetingEnded({
      startsAt: meetingStartsAt,
      endsAt: meetingEndsAt,
      now,
    })
      ? ENDED_MEETING_RANK
      : UPCOMING_OR_IN_PROGRESS_MEETING_RANK,
    meetingStartTime,
  };
};

const compareRankedCanceledCallRecordingBots = ({
  rankedCanceledCallRecordingBot,
  otherRankedCanceledCallRecordingBot,
}: {
  rankedCanceledCallRecordingBot: RankedCanceledCallRecordingBot;
  otherRankedCanceledCallRecordingBot: RankedCanceledCallRecordingBot;
}): number => {
  if (
    rankedCanceledCallRecordingBot.meetingRank !==
    otherRankedCanceledCallRecordingBot.meetingRank
  ) {
    return (
      rankedCanceledCallRecordingBot.meetingRank -
      otherRankedCanceledCallRecordingBot.meetingRank
    );
  }

  if (
    rankedCanceledCallRecordingBot.meetingStartTime !==
    otherRankedCanceledCallRecordingBot.meetingStartTime
  ) {
    return (
      rankedCanceledCallRecordingBot.meetingStartTime -
      otherRankedCanceledCallRecordingBot.meetingStartTime
    );
  }

  const callRecordingId =
    rankedCanceledCallRecordingBot.canceledCallRecordingBot.callRecordingId;
  const otherCallRecordingId =
    otherRankedCanceledCallRecordingBot.canceledCallRecordingBot
      .callRecordingId;

  if (callRecordingId === otherCallRecordingId) {
    return 0;
  }

  return callRecordingId < otherCallRecordingId ? -1 : 1;
};

export const planScheduledRecallBotCancellationMinuteSlots = ({
  canceledCallRecordingBots,
  now,
}: {
  canceledCallRecordingBots: CanceledCallRecordingBot[];
  now: Date;
}): ScheduledRecallBotCancellationPlan => {
  const plannedCancellations = canceledCallRecordingBots
    .map((canceledCallRecordingBot) =>
      rankCanceledCallRecordingBot({ canceledCallRecordingBot, now }),
    )
    .sort(
      (rankedCanceledCallRecordingBot, otherRankedCanceledCallRecordingBot) =>
        compareRankedCanceledCallRecordingBots({
          rankedCanceledCallRecordingBot,
          otherRankedCanceledCallRecordingBot,
        }),
    )
    .slice(0, MAXIMUM_PLANNED_SCHEDULED_RECALL_BOT_CANCELLATIONS)
    .map(
      ({ canceledCallRecordingBot: { callRecordingId, externalBotId } }) => ({
        callRecordingId,
        externalBotId,
      }),
    );

  return {
    minuteSlots: getBatches(
      plannedCancellations,
      SCHEDULED_RECALL_BOT_CANCELLATIONS_PER_MINUTE,
    ),
    unplannedCallRecordingCount:
      canceledCallRecordingBots.length - plannedCancellations.length,
  };
};
