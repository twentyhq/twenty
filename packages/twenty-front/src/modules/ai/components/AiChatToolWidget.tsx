import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { type ToolInput } from '@/ai/types/ToolInput';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrap-tool-input.util';
import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

type AiChatToolWidgetProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  frontComponentId: string;
  isStreaming: boolean;
};

export const AiChatToolWidget = ({
  toolPart,
  frontComponentId,
  isStreaming,
}: AiChatToolWidgetProps) => {
  // A call dispatched through execute_tool carries the real tool and its
  // arguments inside the wrapper; the widget is the dispatched tool's, so it
  // gets that identity rather than the dispatcher's.
  const { toolName, toolInput } = unwrapToolInput({
    input: toolPart.input as ToolInput,
    toolName: getToolName(toolPart),
  });

  const toolCall = {
    toolCallId: toolPart.toolCallId,
    toolName,
    status: toolPart.state,
    input: toolInput as Record<string, unknown> | undefined,
    output:
      toolPart.state === 'output-available'
        ? (toolPart.output as Record<string, unknown> | undefined)
        : undefined,
    errorText:
      toolPart.state === 'output-error' ? toolPart.errorText : undefined,
  };

  return (
    <StyledContainer>
      <Suspense fallback={<FrontComponentSkeletonLoader />}>
        <FrontComponentRenderer
          frontComponentId={frontComponentId}
          toolCall={toolCall}
          loadingFallback={<FrontComponentSkeletonLoader />}
          unavailableFallback={
            <ToolStepRenderer toolPart={toolPart} isStreaming={isStreaming} />
          }
        />
      </Suspense>
    </StyledContainer>
  );
};
