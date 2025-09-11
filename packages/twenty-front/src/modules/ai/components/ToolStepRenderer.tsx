import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { Shimmer } from '@/ai/components/ShimmerEffect';
import type {
  ToolCallEvent,
  ToolEvent,
  ToolResultEvent,
} from '@/ai/types/streamTypes';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledContentContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledToggleButton = styled.div<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'auto')};
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  transition: color ${({ theme }) => theme.animation.duration.normal}s;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledDisplayMessage = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPre = styled.pre`
  margin-top: ${({ theme }) => theme.spacing(1)};
  white-space: pre-wrap;
`;

type ToolStepRendererProps = {
  events: ToolEvent[];
};

export const ToolStepRenderer = ({ events }: ToolStepRendererProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toolCall = events[0] as ToolCallEvent | undefined;
  const toolResult = events.find(
    (event): event is ToolResultEvent => event.type === 'tool-result',
  );

  if (!toolCall) {
    return null;
  }

  const isLoading = !toolResult;

  const toolOutput = toolResult?.result as any;
  const isStandardizedFormat =
    toolOutput && typeof toolOutput === 'object' && 'success' in toolOutput;

  const isSuccess = isStandardizedFormat ? toolOutput.success : true;
  const hasResult = isStandardizedFormat
    ? Boolean(toolOutput.result)
    : Boolean(toolResult?.result);
  const hasError = isStandardizedFormat ? Boolean(toolOutput.error) : false;
  const isExpandable = hasResult || hasError;

  if (isLoading) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>
          <Shimmer>
            <StyledLoadingText>
              {toolCall.args.loadingMessage}
            </StyledLoadingText>
          </Shimmer>
        </StyledLoadingContainer>
      </StyledContainer>
    );
  }

  const displayMessage =
    toolResult?.result &&
    typeof toolResult.result === 'object' &&
    'message' in toolResult.result
      ? (toolResult.result as { message: string }).message
      : undefined;

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => setIsExpanded(!isExpanded)}
        isExpandable={isExpandable}
      >
        {isSuccess ? (
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        ) : (
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        )}
        {isExpandable &&
          (isExpanded ? (
            <IconChevronUp size={theme.icon.size.sm} />
          ) : (
            <IconChevronDown size={theme.icon.size.sm} />
          ))}
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded}>
          <StyledContentContainer>
            {isStandardizedFormat ? (
              <>
                {hasError && (
                  <div>
                    <strong>Error:</strong> {toolOutput.error}
                  </div>
                )}
                {hasResult && (
                  <div>
                    <StyledPre>
                      {JSON.stringify(toolOutput.result, null, 2)}
                    </StyledPre>
                  </div>
                )}
              </>
            ) : toolResult?.result ? (
              JSON.stringify(toolResult.result, null, 2)
            ) : undefined}
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
