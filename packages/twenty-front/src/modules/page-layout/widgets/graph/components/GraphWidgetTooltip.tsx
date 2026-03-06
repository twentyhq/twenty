import { GRAPH_TOOLTIP_MAX_WIDTH_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipMaxWidthPx';
import { GRAPH_TOOLTIP_MIN_WIDTH_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipMinWidthPx';
import { GRAPH_TOOLTIP_SCROLL_MAX_HEIGHT_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipScrollMaxHeightPx';
import { GraphWidgetLegendDot } from '@/page-layout/widgets/graph/components/GraphWidgetLegendDot';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTooltip = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: min(${GRAPH_TOOLTIP_MAX_WIDTH_PX}px, calc(100vw - 40px));
  min-width: ${GRAPH_TOOLTIP_MIN_WIDTH_PX}px;
  pointer-events: auto;
`;

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;

  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: ${GRAPH_TOOLTIP_SCROLL_MAX_HEIGHT_PX}px;
  overflow-y: auto;
`;

const StyledTooltipLink = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  height: ${themeCssVariables.spacing[6]};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding-inline: ${themeCssVariables.spacing[2]};
  line-height: 140%;
`;

const StyledTooltipSeparator = styled.div`
  background-color: ${themeCssVariables.border.color.light};
  min-height: 1px;
  width: 100%;
`;

const StyledTooltipHeader = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 140%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTooltipRowRightContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.extraLight};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  width: 100%;
`;

const StyledTooltipLabel = styled.span<{ isHighlighted?: boolean }>`
  color: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.tertiary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
`;

const StyledNoDataMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledTooltipValue = styled.span<{ isHighlighted?: boolean }>`
  color: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.extraLight};
  flex-shrink: 0;
  font-weight: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledHorizontalSectionPadding = styled.div<{
  addTop?: boolean;
  addBottom?: boolean;
}>`
  padding-inline: ${themeCssVariables.spacing[1]};
  margin-top: ${({ addTop }) => (addTop ? themeCssVariables.spacing[1] : 0)};
  margin-bottom: ${({ addBottom }) =>
    addBottom ? themeCssVariables.spacing[1] : 0};
`;

export type GraphWidgetTooltipItem = {
  key: string;
  label: string;
  formattedValue: string;
  value: number;
  dotColor: string;
};

type GraphWidgetTooltipProps = {
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
  onGraphWidgetTooltipClick?: () => void;
};

export const GraphWidgetTooltip = ({
  items,
  indexLabel,
  highlightedKey,
  onGraphWidgetTooltipClick,
}: GraphWidgetTooltipProps) => {
  const { theme } = useContext(ThemeContext);

  const filteredItems = items.filter(
    (item) => item.value !== 0 && isNonEmptyString(item.formattedValue),
  );

  const hasData = filteredItems.length > 0;
  const shouldHighlight = filteredItems.length > 1;
  const shouldShowClickFooter = hasData && isDefined(onGraphWidgetTooltipClick);

  return (
    <StyledTooltip>
      <StyledHorizontalSectionPadding addTop addBottom={!shouldShowClickFooter}>
        <StyledTooltipContent>
          {indexLabel && (
            <StyledTooltipHeader>{indexLabel}</StyledTooltipHeader>
          )}
          <StyledTooltipRowContainer>
            {filteredItems.length === 0 ? (
              <StyledNoDataMessage>{t`No data`}</StyledNoDataMessage>
            ) : (
              filteredItems.map((item) => {
                const isHighlighted =
                  shouldHighlight && highlightedKey === item.key;
                return (
                  <StyledTooltipRow key={item.key}>
                    <GraphWidgetLegendDot color={item.dotColor} />
                    <StyledTooltipRowRightContent>
                      <StyledTooltipLabel isHighlighted={isHighlighted}>
                        {item.label}
                      </StyledTooltipLabel>
                      <StyledTooltipValue isHighlighted={isHighlighted}>
                        {item.formattedValue}
                      </StyledTooltipValue>
                    </StyledTooltipRowRightContent>
                  </StyledTooltipRow>
                );
              })
            )}
          </StyledTooltipRowContainer>
        </StyledTooltipContent>
      </StyledHorizontalSectionPadding>
      {shouldShowClickFooter && (
        <>
          <StyledTooltipSeparator />
          <StyledHorizontalSectionPadding addBottom>
            <StyledTooltipLink onClick={onGraphWidgetTooltipClick}>
              <span>{t`Click to see data`}</span>
              <IconArrowUpRight size={theme.icon.size.sm} />
            </StyledTooltipLink>
          </StyledHorizontalSectionPadding>
        </>
      )}
    </StyledTooltip>
  );
};
