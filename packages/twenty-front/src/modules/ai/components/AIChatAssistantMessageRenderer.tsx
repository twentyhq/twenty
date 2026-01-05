import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { RoutingStatusDisplay } from '@/ai/components/RoutingStatusDisplay';
import { IconDotsVertical } from 'twenty-ui/display';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const StyledMessagePartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLoadingIconContainer = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
`;

const StyledLoadingIcon = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.light};
  transform: rotate(90deg);
`;

const streamingDotsAnimation = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

const StyledStreamingIndicator = styled.div`
  &::after {
    display: inline-block;
    content: '';
    animation: ${streamingDotsAnimation} 750ms steps(3, end) infinite;
    width: 2ch;
    text-align: left;
  }
`;

const InitialLoadingIndicator = () => {
  const theme = useTheme();

  return (
    <StyledLoadingIconContainer>
      <StyledLoadingIcon size={theme.icon.size.xl} />
    </StyledLoadingIconContainer>
  );
};

const MessagePartRenderer = ({ part }: { part: ExtendedUIMessagePart }) => {
  switch (part.type) {
    case 'reasoning':
      return (
        <ReasoningSummaryDisplay
          content={part.text}
          isThinking={part.state === 'streaming'}
        />
      );
    case 'text':
      return <LazyMarkdownRenderer text={part.text} />;
    case 'data-routing-status':
      return <RoutingStatusDisplay data={part.data} />;
    case 'data-code-execution':
      return (
        <CodeExecutionDisplay
          code={part.data.code}
          stdout={part.data.stdout}
          stderr={part.data.stderr}
          exitCode={part.data.exitCode}
          files={part.data.files}
          isRunning={
            part.data.state === 'running' || part.data.state === 'pending'
          }
        />
      );
    default:
      if (isToolUIPart(part)) {
        return <ToolStepRenderer toolPart={part} />;
      }
      return null;
  }
};

export const AIChatAssistantMessageRenderer = ({
  messageParts,
  isLastMessageStreaming,
  hasError,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  hasError?: boolean;
}) => {
  // Filter out data-code-execution parts when tool-code_interpreter exists
  // (the tool part contains the final result, data-code-execution is for streaming updates)
  const hasCodeInterpreterTool = messageParts.some(
    (part) => part.type === 'tool-code_interpreter',
  );
  const filteredParts = hasCodeInterpreterTool
    ? messageParts.filter((part) => part.type !== 'data-code-execution')
    : messageParts;

  if (!filteredParts.length && !hasError) {
    return <InitialLoadingIndicator />;
  }

  return (
    <div>
      <StyledMessagePartsContainer>
        {filteredParts.map((part, index) => (
          <MessagePartRenderer key={index} part={part} />
        ))}
      </StyledMessagePartsContainer>
      {isLastMessageStreaming && !hasError && <StyledStreamingIndicator />}
    </div>
  );
};
