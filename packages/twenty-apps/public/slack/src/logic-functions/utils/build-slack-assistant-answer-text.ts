import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerText = ({
  responseText,
  durationMilliseconds,
}: {
  responseText: string;
  durationMilliseconds: number;
}): string =>
  `${responseText}\n\n_AI-generated · Answered in ${formatSlackAssistantDuration(durationMilliseconds)}_`;
