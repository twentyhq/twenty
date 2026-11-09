import { WidgetCardHeaderPillsMaxWidthContext } from '@/page-layout/contexts/WidgetCardHeaderPillsMaxWidthContext';
import { hasWidgetDashboardFilterHeaderCollapsibleItem } from '@/page-layout/utils/hasWidgetDashboardFilterHeaderCollapsibleItem';
import { type WidgetDashboardFilterHeaderContent } from '@/page-layout/types/WidgetDashboardFilterHeaderContent';
import { WidgetCardHeaderHoverReveal } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderHoverReveal';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { styled } from '@linaria/react';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconFilter, IconFilterOff } from 'twenty-ui/icon';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useIsTouchDevice } from 'twenty-ui/utilities';

// Same tokens as the "Not shared" pill this header shows for a forbidden widget
const StyledPill = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[5]};
  line-height: ${themeCssVariables.text.lineHeight.md};
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledStatusContainer = styled.div`
  display: flex;
  min-width: 0;
`;

const StyledHoverIndicator = styled.span`
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

const StyledMeasure = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  visibility: hidden;
  width: max-content;
`;

// The measured copy draws its text in CSS, so it never doubles the real text
const StyledMeasuredText = styled.span`
  &::after {
    content: attr(data-text);
  }
`;

type WidgetDashboardFilterHeaderItemsProps = {
  content: WidgetDashboardFilterHeaderContent;
};

export const WidgetDashboardFilterHeaderItems = ({
  content: { fieldLabels, pills, hoverIndicatorText },
}: WidgetDashboardFilterHeaderItemsProps) => {
  const theme = useTheme();
  const isTouchDevice = useIsTouchDevice();
  const maxWidth = useContext(WidgetCardHeaderPillsMaxWidthContext);
  const measureRef = useRef<HTMLDivElement>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const handleMeasureDimensionChange = useCallback(
    ({ width }: { width: number }) => setNaturalWidth(width),
    [],
  );

  // Rather than truncate, items collapse to their icon, but only where hover can open the tooltip that names them
  const canCollapse =
    !isTouchDevice &&
    hasWidgetDashboardFilterHeaderCollapsibleItem({ fieldLabels, pills });
  const isCompact =
    canCollapse && isDefined(maxWidth) && naturalWidth > maxWidth;

  const renderItems = (isMeasure: boolean) => {
    const renderText = (text: string, isCollapsible = true): ReactNode =>
      isMeasure ? (
        <StyledMeasuredText data-text={text} />
      ) : isCompact && isCollapsible ? (
        <VisuallyHidden>{text}</VisuallyHidden>
      ) : (
        <StyledText>{text}</StyledText>
      );

    const withTooltip = (
      key: string,
      tooltip: string,
      trigger: ReactElement,
    ) =>
      isMeasure ? (
        <span key={key}>{trigger}</span>
      ) : (
        <Tooltip key={key} content={tooltip} delay={TooltipDelay.mediumDelay}>
          {trigger}
        </Tooltip>
      );

    return (
      <>
        {fieldLabels.map(({ pageLayoutFilterId, kind, text, fullText }) => {
          const Icon = kind === 'APPLIED' ? IconCalendarEvent : IconFilterOff;

          return withTooltip(
            pageLayoutFilterId,
            fullText,
            <StyledFieldLabel>
              <Icon size={theme.icon.size.sm} />
              {renderText(text)}
            </StyledFieldLabel>,
          );
        })}
        {pills.map(({ pageLayoutFilterId, kind, text, tooltip }) => {
          const Icon = kind === 'OVERLAP' ? IconFilter : IconFilterOff;

          return withTooltip(
            pageLayoutFilterId,
            tooltip,
            kind === 'UNAVAILABLE' ? (
              <StyledStatusContainer>
                <Status color="orange">{renderText(text, false)}</Status>
              </StyledStatusContainer>
            ) : (
              <StyledPill>
                <Icon size={theme.icon.size.sm} />
                {renderText(text)}
              </StyledPill>
            ),
          );
        })}
        {isDefined(hoverIndicatorText) &&
          (isMeasure ? (
            <IconCalendarEvent size={theme.icon.size.sm} />
          ) : (
            <WidgetCardHeaderHoverReveal isAlwaysVisible={isTouchDevice}>
              {withTooltip(
                'hover-indicator',
                hoverIndicatorText,
                <StyledHoverIndicator
                  role="img"
                  tabIndex={0}
                  aria-label={hoverIndicatorText}
                >
                  <IconCalendarEvent size={theme.icon.size.sm} />
                </StyledHoverIndicator>,
              )}
            </WidgetCardHeaderHoverReveal>
          ))}
      </>
    );
  };

  return (
    <>
      {canCollapse && (
        <>
          <NodeDimensionEffect
            elementRef={measureRef}
            onDimensionChange={handleMeasureDimensionChange}
          />
          <StyledMeasure ref={measureRef} aria-hidden>
            {renderItems(true)}
          </StyledMeasure>
        </>
      )}
      {renderItems(false)}
    </>
  );
};
