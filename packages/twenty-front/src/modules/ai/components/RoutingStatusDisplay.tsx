import { RoutingDebugDisplay } from '@/ai/components/RoutingDebugDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { type DataMessagePart } from 'twenty-shared/ai';
import { IconChevronDown, IconChevronUp, IconCpu } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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
    color: ${({ isExpandable, theme }) =>
      isExpandable ? theme.font.color.secondary : theme.font.color.tertiary};
  }
`;

const StyledDisplayMessage = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIconTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  svg {
    min-width: ${({ theme }) => theme.icon.size.sm}px;
  }
`;

const StyledContentContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const RoutingStatusDisplay = ({
  data,
}: {
  data: DataMessagePart['routing-status'];
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLoading = data.state === 'loading';
  const isDebugMode = process.env.IS_DEBUG_MODE === 'true';
  const isExpandable = isDebugMode && data.state === 'routed' && data.debug;

  if (data.state === 'error') {
    return null;
  }

  if (isLoading) {
    return (
      <StyledContainer>
        <StyledIconTextContainer>
          <IconCpu size={theme.icon.size.sm} />
          <ShimmeringText>
            <StyledDisplayMessage>{data.text}</StyledDisplayMessage>
          </ShimmeringText>
        </StyledIconTextContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
        isExpandable={!!isExpandable}
      >
        <StyledIconTextContainer>
          <IconCpu size={theme.icon.size.sm} />
          <StyledDisplayMessage>{data.text}</StyledDisplayMessage>
        </StyledIconTextContainer>
        {isExpandable &&
          (isExpanded ? (
            <IconChevronUp size={theme.icon.size.sm} />
          ) : (
            <IconChevronDown size={theme.icon.size.sm} />
          ))}
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
          <StyledContentContainer>
            <RoutingDebugDisplay debug={data.debug!} />
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
