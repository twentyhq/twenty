import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconAlertTriangle, IconTerminal } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { ThinkingStepRowLayout } from '@/ai-chat/thinking-steps/components/ThinkingStepRowLayout';
import { ToolRecordsWidget } from '@/ai-chat/thinking-steps/components/ToolRecordsWidget';
import { getThinkingStepLabel } from '@/ai-chat/thinking-steps/utils/getThinkingStepLabel';
import { getToolRecordOutput } from '@/ai-chat/thinking-steps/utils/getToolRecordOutput';
import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';
import { useOpenAiChatToolCallInSidePanel } from '@/side-panel/hooks/useOpenAiChatToolCallInSidePanel';

const StyledToolRecordsContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[6]};
`;

type ThinkingToolStepRowProps = {
  isActive: boolean;
  part: ToolUIPart | DynamicToolUIPart;
};

export const ThinkingToolStepRow = ({
  isActive,
  part,
}: ThinkingToolStepRowProps) => {
  const { t } = useLingui();
  const { toolName } = unwrapToolPartInput(part);
  const displayContext = useToolDisplayContext();
  const { openAiChatToolCallInSidePanel } = useOpenAiChatToolCallInSidePanel();

  const ToolIcon = getToolIcon(toolName);
  const displayMessage = getThinkingStepLabel({
    part,
    isActive,
    displayContext,
  });
  const hasError = part.state === 'output-error';
  const isFinished = part.state === 'output-available' || hasError;
  const { message: recordsMessage, recordReferences } =
    getToolRecordOutput(part);
  const [errorFirstLine] = (part.errorText ?? '').split('\n');
  const showDetailsLabel = t`Show details`;

  return (
    <ThinkingStepRowLayout
      icon={
        hasError ? (
          <IconAlertTriangle
            size={14}
            color={themeCssVariables.font.color.danger}
          />
        ) : (
          <ToolIcon size={14} />
        )
      }
      label={displayMessage}
      detail={
        hasError && isNonEmptyString(errorFirstLine)
          ? errorFirstLine
          : undefined
      }
      isActive={isActive}
      action={
        isFinished ? (
          <LightIconButton
            size="xs"
            aria-label={showDetailsLabel}
            tooltip={showDetailsLabel}
            onClick={() =>
              openAiChatToolCallInSidePanel({
                part,
                title: displayMessage,
                Icon: ToolIcon,
              })
            }
          >
            <IconTerminal />
          </LightIconButton>
        ) : undefined
      }
      isActionAlwaysVisible={hasError}
      footer={
        isNonEmptyArray(recordReferences) ? (
          <StyledToolRecordsContainer>
            <ToolRecordsWidget
              message={recordsMessage ?? ''}
              recordReferences={recordReferences}
            />
          </StyledToolRecordsContainer>
        ) : undefined
      }
    />
  );
};
