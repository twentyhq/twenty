import { useLingui } from '@lingui/react/macro';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { IconListDetails } from 'twenty-ui/icon';

import { ThinkingStepRowLayout } from '@/ai-chat/thinking-steps/components/ThinkingStepRowLayout';
import { AiChatAskStatusRow } from '@/ai-chat/tool-calls/components/AiChatAskStatusRow';
import { AiChatFormSubmittedDetails } from '@/ai-chat/tool-calls/components/AiChatFormSubmittedDetails';
import { useIsAiChatToolCallAskedInComposer } from '@/ai-chat/tool-calls/hooks/useIsAiChatToolCallAskedInComposer';

export const AiChatFormStatusRenderer = ({
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

  const fields =
    (toolPart.input as Partial<RequestFormToolInput> | undefined)?.fields ?? [];
  const result = (
    toolPart.output as { result?: RequestFormToolResult } | null | undefined
  )?.result;
  const status = result?.status ?? 'pending';
  const values = result?.values ?? {};

  const messageByStatus = {
    pending: t`Waiting for a form to be filled in`,
    skipped: t`Form skipped`,
  };

  if (isAskedInComposer) {
    return null;
  }

  if (status === 'answered') {
    return (
      <ThinkingStepRowLayout
        icon={<IconListDetails size={14} />}
        label={t`Request form`}
        isActive={false}
        details={<AiChatFormSubmittedDetails fields={fields} values={values} />}
      />
    );
  }

  return (
    <AiChatAskStatusRow
      Icon={IconListDetails}
      message={messageByStatus[status]}
      isShimmering={isStreaming && status === 'pending'}
    />
  );
};
