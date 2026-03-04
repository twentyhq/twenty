import { RoutingDebugDisplay } from '@/ai/components/RoutingDebugDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { type DataMessagePart } from 'twenty-shared/ai';
import { IconChevronDown, IconChevronUp, IconCpu } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToggleButton = styled.div<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'auto')};
  display: flex;
  color: ${themeCssVariables.font.color.tertiary};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;
  transition: color calc(${themeCssVariables.animation.duration.normal} * 1s);

  &:hover {
    color: ${({ isExpandable }) =>
      isExpandable
        ? themeCssVariables.font.color.secondary
        : themeCssVariables.font.color.tertiary};
  }
`;

const StyledDisplayMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledIconTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};

  svg {
    min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
  }
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

export const RoutingStatusDisplay = ({
  data,
}: {
  data: DataMessagePart['routing-status'];
}) => {
  const { theme } = useContext(ThemeContext);
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
