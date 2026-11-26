import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type AskQuestionsToolResult,
  type AskQuestionToolResult,
} from 'twenty-shared/ai';
import { IconHelpCircle } from 'twenty-ui/icon';

import { ThinkingStepRowLayout } from '@/ai-chat/thinking-steps/components/ThinkingStepRowLayout';
import { AiChatAskStatusRow } from '@/ai-chat/tool-calls/components/AiChatAskStatusRow';
import { AiChatQuestionAnsweredDetails } from '@/ai-chat/tool-calls/components/AiChatQuestionAnsweredDetails';
import { useIsAiChatToolCallAskedInComposer } from '@/ai-chat/tool-calls/hooks/useIsAiChatToolCallAskedInComposer';
import { TextWithChatReferences } from '@/ai-chat/message-content/components/TextWithChatReferences';
import { getChatReferencePlainText } from '@/ai-chat/message-content/utils/getChatReferencePlainText';
import { getAskedQuestionEntries } from '@/ai-chat/tool-calls/utils/getAskedQuestionEntries';

export const AiChatQuestionStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const isAskedInComposer = useIsAiChatToolCallAskedInComposer(
    toolPart.toolCallId,
  );

  const result = (
    toolPart.output as {
      result?: AskQuestionToolResult | AskQuestionsToolResult;
    } | null
  )?.result;
  const status = result?.status ?? 'pending';
  const entries = getAskedQuestionEntries(result);

  if (isAskedInComposer) {
    return null;
  }

  if (status === 'pending') {
    if (entries.length !== 1) {
      return (
        <AiChatAskStatusRow
          Icon={IconHelpCircle}
          message={t`Asking questions...`}
          isShimmering={isStreaming}
        />
      );
    }

    const pendingQuestion = entries[0].question.question;

    return (
      <AiChatAskStatusRow
        Icon={IconHelpCircle}
        message={
          isStreaming ? (
            getChatReferencePlainText(pendingQuestion)
          ) : (
            <TextWithChatReferences text={pendingQuestion} />
          )
        }
        isShimmering={isStreaming}
      />
    );
  }

  if (status === 'skipped') {
    return (
      <AiChatAskStatusRow
        Icon={IconHelpCircle}
        message={
          entries.length > 1 ? t`Questions skipped` : t`Question skipped`
        }
        isShimmering={false}
      />
    );
  }

  const headers = entries.map(({ question }) => question.header);
  const label =
    entries.length > 1 && headers.every(isNonEmptyString)
      ? headers.join(', ')
      : getChatReferencePlainText(entries[0]?.question.question ?? '');

  return (
    <ThinkingStepRowLayout
      icon={<IconHelpCircle size={14} />}
      label={label}
      isActive={false}
      details={<AiChatQuestionAnsweredDetails entries={entries} />}
    />
  );
};
