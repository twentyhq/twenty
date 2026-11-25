import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { ShimmeringText } from '@/ai-chat/components/ShimmeringText';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledRowLabel = styled.div`
  color: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  white-space: nowrap;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
  min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
`;

const StyledRowLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledChevronContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
  transform: rotate(0deg);
  transition: transform calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;

  [data-panel-open] & {
    transform: rotate(90deg);
  }
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};
  display: flex;
  font-family: inherit;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 24px;
  padding: 0;
  text-align: left;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  width: 100%;

  &:hover {
    color: ${({ isExpandable }) =>
      isExpandable
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledShimmeringLabel = styled(ShimmeringText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRowDetail = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRowAction = styled.div<{ isAlwaysVisible: boolean }>`
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
  opacity: ${({ isAlwaysVisible }) => (isAlwaysVisible ? 1 : 0)};
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;

  [data-thinking-step-row]:hover &,
  [data-thinking-step-row]:focus-within & {
    opacity: 1;
  }
`;

type ThinkingStepRowLayoutProps = {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  detail?: string;
  details?: ReactNode;
  action?: ReactNode;
  isActionAlwaysVisible?: boolean;
  footer?: ReactNode;
};

export const ThinkingStepRowLayout = ({
  icon,
  label,
  isActive,
  detail,
  details,
  action,
  isActionAlwaysVisible = false,
  footer,
}: ThinkingStepRowLayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandable = isDefined(details);

  const rowContent = (
    <>
      <StyledIconContainer>{icon}</StyledIconContainer>
      <StyledRowLabelContainer>
        <StyledRowLabel>
          {isActive ? (
            <StyledShimmeringLabel>{label}</StyledShimmeringLabel>
          ) : (
            <OverflowingTextWithTooltip
              text={label}
              tooltipDelay={TooltipDelay.shortDelay}
            />
          )}
        </StyledRowLabel>
        {isDefined(detail) && <StyledRowDetail>{detail}</StyledRowDetail>}
        {isExpandable && (
          <StyledChevronContainer>
            <IconChevronRight size={14} />
          </StyledChevronContainer>
        )}
      </StyledRowLabelContainer>
    </>
  );

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledRowContainer data-thinking-step-row />}
    >
      {isExpandable ? (
        <Collapsible.Trigger render={<StyledRow as="button" isExpandable />}>
          {rowContent}
        </Collapsible.Trigger>
      ) : (
        <StyledRow isExpandable={false}>
          {rowContent}
          {isDefined(action) && (
            <StyledRowAction isAlwaysVisible={isActionAlwaysVisible}>
              {action}
            </StyledRowAction>
          )}
        </StyledRow>
      )}

      {isExpandable && <Collapsible.Panel>{details}</Collapsible.Panel>}
      {footer}
    </Collapsible.Root>
  );
};
