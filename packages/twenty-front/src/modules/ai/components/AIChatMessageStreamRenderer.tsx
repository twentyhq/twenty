import { ErrorStepRenderer } from '@/ai/components/ErrorStepRenderer';
import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { TextStepRenderer } from '@/ai/components/TextStepRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import type {
  AIChatMessageStreamRendererProps,
  ParsedStep,
} from '@/ai/types/streamTypes';
import { parseStream } from '@/ai/utils/parseStream';
import { IconDotsVertical } from 'twenty-ui/display';

import { agentStreamingMessageState } from '@/ai/states/agentStreamingMessageState';
import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

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

export const AIChatMessageStreamRenderer = ({
  streamData,
}: AIChatMessageStreamRendererProps) => {
  const agentStreamingMessage = useRecoilValue(agentStreamingMessageState);
  const isStreaming = Boolean(agentStreamingMessage);

  const steps = parseStream(streamData);
  const theme = useTheme();

  if (!streamData || !steps.length) {
    return (
      <StyledDotsIconContainer>
        <StyledDotsIcon size={theme.icon.size.xl} />
      </StyledDotsIconContainer>
    );
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
        return <TextStepRenderer key={index} content={step.content} />;
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
      {steps.map(renderStep)}
      {isStreaming && <StyledToolCallContainer />}
    </div>
  );
};
