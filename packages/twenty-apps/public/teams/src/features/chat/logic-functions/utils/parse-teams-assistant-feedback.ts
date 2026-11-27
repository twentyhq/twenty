import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ASSISTANT_FEEDBACK_RATING } from 'src/features/chat/logic-functions/constants/teams-assistant-feedback-rating';
import { type TeamsAssistantFeedbackRating } from 'src/features/chat/logic-functions/types/teams-assistant-feedback-rating.type';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

const parseFeedbackRating = (
  reaction: string | undefined,
): TeamsAssistantFeedbackRating | undefined => {
  switch (reaction) {
    case 'like':
      return TEAMS_ASSISTANT_FEEDBACK_RATING.POSITIVE;
    case 'dislike':
      return TEAMS_ASSISTANT_FEEDBACK_RATING.NEGATIVE;
    default:
      return undefined;
  }
};

const parseFeedbackText = (feedback: string | undefined): string => {
  if (!isNonEmptyString(feedback)) {
    return '';
  }

  try {
    const parsedFeedback: { feedbackText?: unknown } | null =
      JSON.parse(feedback);

    return isNonEmptyString(parsedFeedback?.feedbackText)
      ? parsedFeedback.feedbackText.trim()
      : '';
  } catch (error) {
    console.warn('[teams] could not read the feedback comment', error);

    return '';
  }
};

export const parseTeamsAssistantFeedback = (
  activity: Pick<TeamsInboundActivity, 'value'>,
):
  | { feedbackRating: TeamsAssistantFeedbackRating; feedbackText: string }
  | undefined => {
  const feedbackRating = parseFeedbackRating(
    activity.value?.actionValue?.reaction,
  );

  if (!isDefined(feedbackRating)) {
    return undefined;
  }

  return {
    feedbackRating,
    feedbackText: parseFeedbackText(activity.value?.actionValue?.feedback),
  };
};
