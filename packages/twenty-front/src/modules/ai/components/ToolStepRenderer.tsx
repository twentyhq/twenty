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

const StyledToggleButton = styled.button<{ isExpandable: boolean }>`
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

const StyledButtonText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
  const isExpandable = Boolean(toolResult?.result);

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

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => setIsExpanded(!isExpanded)}
        isExpandable={isExpandable}
      >
        <StyledButtonText>{toolCall.args.loadingMessage}</StyledButtonText>
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
            {toolResult?.result ? JSON.stringify(toolResult.result) : undefined}
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
