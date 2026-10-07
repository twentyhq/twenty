import { useLingui } from '@lingui/react/macro';

import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { getAiChatIncludedChatResumeDate } from '@/ai/utils/getAiChatIncludedChatResumeDate';
import { beautifyExactDateTime } from '~/utils/date-utils';

type AiChatIncludedChatPausedMessageProps = {
  error: AiChatError;
};

// No retry: the server refuses until the ceiling resets. No limits button: members cannot see or change this limit
export const AiChatIncludedChatPausedMessage = ({
  error,
}: AiChatIncludedChatPausedMessageProps) => {
  const { t } = useLingui();

  const resumeTime = beautifyExactDateTime(
    getAiChatIncludedChatResumeDate(new Date()),
  );

  return (
    <AiChatErrorMessage
      error={error}
      title={t`Included chat paused`}
      message={t`Your workspace reached today’s included chat limit. It resumes at ${resumeTime}.`}
      hint={t`Pick another model to keep chatting with your credits.`}
    />
  );
};
