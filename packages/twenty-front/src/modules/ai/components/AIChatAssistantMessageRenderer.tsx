import { ErrorStepRenderer } from '@/ai/components/ErrorStepRenderer';
import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import type { ParsedStep } from '@/ai/types/streamTypes';
import { hasStructuredStreamData } from '@/ai/utils/hasStructuredStreamData';
import { parseStream } from '@/ai/utils/parseStream';
import { IconDotsVertical } from 'twenty-ui/display';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { agentStreamingMessageState } from '@/ai/states/agentStreamingMessageState';
import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDotsIconContainer = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
`;

const StyledDotsIcon = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.light};
  transform: rotate(90deg);
`;

const dots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

const StyledToolCallContainer = styled.div`
  &::after {
    display: inline-block;
    content: '';
    animation: ${dots} 750ms steps(3, end) infinite;
    width: 2ch;
    text-align: left;
  }
`;

const LoadingDotsIcon = () => {
  const theme = useTheme();

  return (
    <StyledDotsIconContainer>
      <StyledDotsIcon size={theme.icon.size.xl} />
    </StyledDotsIconContainer>
  );
};

export const AIChatAssistantMessageRenderer = ({
  streamData,
}: {
  streamData: string;
}) => {
  const agentStreamingMessage = useRecoilValue(agentStreamingMessageState);
  const isStreaming = streamData === agentStreamingMessage;

  if (!streamData) {
    return <LoadingDotsIcon />;
  }

  const hasStructuredData = hasStructuredStreamData(streamData);

  if (!hasStructuredData) {
    return <LazyMarkdownRenderer text={streamData} />;
  }

  const steps = parseStream(streamData);

  if (!steps.length) {
    return <LoadingDotsIcon />;
  }

  const renderStep = (step: ParsedStep, index: number) => {
    switch (step.type) {
      case 'tool':
        return <ToolStepRenderer key={index} events={step.events} />;
      case 'reasoning':
        return (
          <ReasoningSummaryDisplay
            key={index}
            content={step.content}
            isThinking={step.isThinking}
          />
        );
      case 'text':
        return <LazyMarkdownRenderer key={index} text={step.content} />;
      case 'error':
        return (
          <ErrorStepRenderer
            key={index}
            message={step.message}
            error={step.error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <StyledStepsContainer>{steps.map(renderStep)}</StyledStepsContainer>
      {isStreaming && <StyledToolCallContainer />}
    </div>
  );
};
