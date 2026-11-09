import { type WidgetDashboardFilterHeaderContent } from '@/page-layout/types/WidgetDashboardFilterHeaderContent';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconFilter, IconFilterOff } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledPill = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 20px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledPillText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledFieldLabelIcon = styled.span`
  display: flex;
  flex-shrink: 0;
`;

// Hidden on pointer devices until the widget is hovered or the icon focused, without taking width
const StyledHoverIndicator = styled.span<{ isRevealed: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
  opacity: ${({ isRevealed }) => (isRevealed ? '1' : '0')};
  overflow: hidden;
  width: ${({ isRevealed }) => (isRevealed ? 'auto' : '0')};

  &:focus-visible {
    opacity: 1;
    width: auto;
  }
`;

type WidgetDashboardFilterHeaderItemsProps = {
  content: WidgetDashboardFilterHeaderContent;
};

export const WidgetDashboardFilterHeaderItems = ({
  content: { fieldLabels, pills, hoverIndicatorText },
}: WidgetDashboardFilterHeaderItemsProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const widgetComponentInstance = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );
  const widgetCardHovered = useAtomComponentFamilyStateValue(
    widgetCardHoveredComponentFamilyState,
    widgetComponentInstance?.instanceId ?? '',
  );

  return (
    <>
      {fieldLabels.map(({ pageLayoutFilterId, kind, text, fullText }) => {
        const Icon = kind === 'APPLIED' ? IconCalendarEvent : IconFilterOff;

        return (
          <Tooltip
            key={pageLayoutFilterId}
            content={fullText}
            delay={TooltipDelay.mediumDelay}
          >
            <StyledFieldLabel role="img" aria-label={fullText}>
              <StyledFieldLabelIcon>
                <Icon size={theme.icon.size.sm} />
              </StyledFieldLabelIcon>
              <StyledPillText>{text}</StyledPillText>
            </StyledFieldLabel>
          </Tooltip>
        );
      })}
      {pills.map(({ pageLayoutFilterId, kind, text, tooltip }) => {
        const Icon = kind === 'OVERLAP' ? IconFilter : IconFilterOff;

        return (
          <Tooltip
            key={pageLayoutFilterId}
            content={tooltip}
            delay={TooltipDelay.mediumDelay}
          >
            <StyledPill>
              <Icon size={theme.icon.size.sm} />
              <StyledPillText>{text}</StyledPillText>
            </StyledPill>
          </Tooltip>
        );
      })}
      {isDefined(hoverIndicatorText) && (
        <Tooltip content={hoverIndicatorText} delay={TooltipDelay.shortDelay}>
          <StyledHoverIndicator
            role="img"
            tabIndex={0}
            aria-label={hoverIndicatorText}
            isRevealed={isMobile || widgetCardHovered}
          >
            <IconCalendarEvent size={theme.icon.size.sm} />
          </StyledHoverIndicator>
        </Tooltip>
      )}
    </>
  );
};
