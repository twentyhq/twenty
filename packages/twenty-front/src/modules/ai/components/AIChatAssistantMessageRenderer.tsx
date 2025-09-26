import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { IconDotsVertical } from 'twenty-ui/display';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { ToolUIPart, UIDataTypes, UIMessagePart, UITools } from 'ai';

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
  messageParts,
  isStreaming,
}: {
  messageParts: UIMessagePart<UIDataTypes, UITools>[];
  isStreaming: boolean;
}) => {
  const renderStep = (
    step: UIMessagePart<UIDataTypes, UITools>,
    index: number,
  ) => {
    switch (step.type) {
      case 'reasoning':
        return (
          <ReasoningSummaryDisplay
            key={index}
            content={step.text}
            isThinking={step.state === 'streaming'}
          />
        );
      case 'text':
        return <LazyMarkdownRenderer key={index} text={step.text} />;
      default:
        {
          if (step.type.includes('tool-')) {
            const { output, input, type } = step as ToolUIPart;
            return (
              <ToolStepRenderer
                key={index}
                input={input}
                output={output}
                toolName={type.split('-')[1]}
              />
            );
          }
        }
        return null;
    }
  };

  if (!messageParts.length) {
    return <LoadingDotsIcon />;
  }

  return (
    <div>
      <StyledStepsContainer>
        {messageParts.map(renderStep)}
      </StyledStepsContainer>
      {isStreaming && <StyledToolCallContainer />}
    </div>
  );
};
