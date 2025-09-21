import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import type { ToolCallEvent } from '@/ai/types/ToolCallEvent';
import type { ToolEvent } from '@/ai/types/ToolEvent';
import type { ToolResultEvent } from '@/ai/types/ToolResultEvent';
import { getToolIcon } from '@/ai/utils/getToolIcon';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledIconTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  svg {
    min-width: ${({ theme }) => theme.icon.size.sm}px;
  }
`;

export const ToolStepRenderer = ({ events }: { events: ToolEvent[] }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toolCallEvent = events[0] as ToolCallEvent | undefined;
  const toolResultEvent = events.find(
    (event): event is ToolResultEvent => event.type === 'tool-result',
  );

  if (!toolCallEvent) {
    return null;
  }

  const toolOutput = toolResultEvent?.output
    .result as ToolResultEvent['output'];

  const isExpandable = !!toolOutput;

  if (!toolResultEvent) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>
          <ShimmeringText>
            <StyledDisplayMessage>
              {toolCallEvent.input.loadingMessage}
            </StyledDisplayMessage>
          </ShimmeringText>
        </StyledLoadingContainer>
      </StyledContainer>
    );
  }

  const displayMessage =
    toolResultEvent?.output &&
    typeof toolResultEvent.output === 'object' &&
    'message' in toolResultEvent.output
      ? (toolResultEvent.output as { message: string }).message
      : undefined;

  const ToolIcon = getToolIcon(toolCallEvent.toolName);

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => setIsExpanded(!isExpanded)}
        isExpandable={isExpandable}
      >
        <StyledIconTextContainer>
          <ToolIcon size={theme.icon.size.sm} />
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        </StyledIconTextContainer>
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
            <StyledPre>
              {JSON.stringify(toolOutput.error || toolOutput, null, 2)}
            </StyledPre>
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
