import { styled } from '@linaria/react';
import type { LineSeries, Point } from '@nivo/line';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTooltipContainer = styled.div`
  backdrop-filter: ${themeCssVariables.blur.medium};
  background-color: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTooltipItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipLabel = styled.span`
  flex: 1;
`;

const StyledTooltipValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type ApplicationMonitoringChartTooltipProps = {
  title: string;
  points: readonly Point<LineSeries>[];
};

export const ApplicationMonitoringChartTooltip = ({
  title,
  points,
}: ApplicationMonitoringChartTooltipProps) => (
  <StyledTooltipContainer>
    <StyledTooltipTitle>{title}</StyledTooltipTitle>
    {points.map((point) => (
      <StyledTooltipItem key={point.id}>
        <StyledTooltipColorCircle color={point.seriesColor} />
        <StyledTooltipLabel>{point.seriesId}</StyledTooltipLabel>
        <StyledTooltipValue>{point.data.yFormatted}</StyledTooltipValue>
      </StyledTooltipItem>
    ))}
  </StyledTooltipContainer>
);
