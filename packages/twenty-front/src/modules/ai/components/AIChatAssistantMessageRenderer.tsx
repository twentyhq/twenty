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

export const AIChatAssistantMessageRenderer = ({
  messageParts,
  isLastMessageStreaming,
  hasError,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  hasError?: boolean;
}) => {
  const renderMessagePart = (part: ExtendedUIMessagePart, index: number) => {
    switch (part.type) {
      case 'reasoning':
        return (
          <ReasoningSummaryDisplay
            key={index}
            content={part.text}
            isThinking={part.state === 'streaming'}
          />
        );
      case 'text':
        return <LazyMarkdownRenderer key={index} text={part.text} />;
      case 'data-routing-status':
        return <RoutingStatusDisplay data={part.data} key={index} />;
      default:
        {
          if (isToolUIPart(part)) {
            return <ToolStepRenderer key={index} toolPart={part} />;
          }
        }
        return null;
    }
  };

  if (!messageParts.length && !hasError) {
    return <InitialLoadingIndicator />;
  }

  return (
    <div>
      <StyledMessagePartsContainer>
        {messageParts.map(renderMessagePart)}
      </StyledMessagePartsContainer>
      {isLastMessageStreaming && !hasError && <StyledStreamingIndicator />}
    </div>
  );
};
