import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTerminal } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { ThinkingStepRowLayout } from '@/ai-chat/thinking-steps/components/ThinkingStepRowLayout';
import { ThinkingToolStepRecordsDetail } from '@/ai-chat/thinking-steps/components/ThinkingToolStepRecordsDetail';
import { getThinkingStepLabel } from '@/ai-chat/thinking-steps/utils/getThinkingStepLabel';
import { getToolPartError } from '@/ai-chat/thinking-steps/utils/getToolPartError';
import { getToolRecordOutput } from '@/ai-chat/thinking-steps/utils/getToolRecordOutput';
import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';
import { useOpenAiChatToolCallInSidePanel } from '@/side-panel/hooks/useOpenAiChatToolCallInSidePanel';

type ThinkingToolStepRowProps = {
  isActive: boolean;
  part: ToolUIPart | DynamicToolUIPart;
};

export const ThinkingToolStepRow = ({
  isActive,
  part,
}: ThinkingToolStepRowProps) => {
  const { t } = useLingui();
  const { threadId } = useAiChatInstanceOrThrow();
  const { toolName } = unwrapToolPartInput(part);
  const displayContext = useToolDisplayContext();
  const { openAiChatToolCallInSidePanel } = useOpenAiChatToolCallInSidePanel();

  const ToolIcon = getToolIcon(toolName);
  const displayMessage = getThinkingStepLabel({
    part,
    isActive,
    displayContext,
  });
  const { hasError, errorText } = getToolPartError(part);
  const isFinished =
    part.state === 'output-available' || part.state === 'output-error';
  const { recordReferences } = getToolRecordOutput(part);
  const [errorFirstLine] = (errorText ?? '').split('\n');
  const errorDetail =
    hasError && isNonEmptyString(errorFirstLine) ? errorFirstLine : undefined;
  const recordsDetail = isNonEmptyArray(recordReferences) ? (
    <ThinkingToolStepRecordsDetail recordReferences={recordReferences} />
  ) : undefined;
  const showDetailsLabel = t`Show details`;

  return (
    <ThinkingStepRowLayout
      icon={
        <ToolIcon
          size={14}
          color={hasError ? themeCssVariables.font.color.danger : undefined}
        />
      }
      label={displayMessage}
      detail={errorDetail ?? recordsDetail}
      isActive={isActive}
      action={
        isFinished ? (
          <LightIconButton
            size="xs"
            color={hasError ? 'danger' : 'neutral'}
            aria-label={showDetailsLabel}
            tooltip={showDetailsLabel}
            onClick={() =>
              openAiChatToolCallInSidePanel({
                threadId,
                toolCallId: part.toolCallId,
                title: displayMessage,
                Icon: ToolIcon,
              })
            }
          >
            <IconTerminal />
          </LightIconButton>
        ) : undefined
      }
      isError={hasError}
    />
  );
};
