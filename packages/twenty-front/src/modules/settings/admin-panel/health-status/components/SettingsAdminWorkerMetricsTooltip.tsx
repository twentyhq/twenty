import { styled } from '@linaria/react';
import type { LineSeries, Point } from '@nivo/line';
import { type ReactElement } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledTooltipItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
`;

const StyledTooltipColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 8px;
  margin-right: ${themeCssVariables.spacing[2]};
  width: 8px;
`;

const StyledTooltipDataRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: ${themeCssVariables.font.color.tertiary};
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTooltipValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type SettingsAdminWorkerMetricsTooltipProps = {
  slice: {
    points: readonly Point<LineSeries>[];
  };
};

export const SettingsAdminWorkerMetricsTooltip = ({
  slice,
}: SettingsAdminWorkerMetricsTooltipProps): ReactElement => {
  return (
    <StyledTooltipContainer>
      {slice.points.map((point) => (
        <StyledTooltipItem key={point.id} color={point.seriesColor}>
          <StyledTooltipColorCircle color={point.seriesColor} />
          <StyledTooltipDataRow>
            <span>{point.seriesId}</span>
            <StyledTooltipValue>{point.data.yFormatted}</StyledTooltipValue>
          </StyledTooltipDataRow>
        </StyledTooltipItem>
      ))}
    </StyledTooltipContainer>
  );
};
