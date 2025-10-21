import styled from '@emotion/styled';
import type { LineSeries, Point } from '@nivo/line';
import { type ReactElement } from 'react';

const StyledTooltipContainer = styled.div`
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  background-color: ${({ theme }) => theme.background.transparent.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTooltipItem = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
`;

const StyledTooltipColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 8px;
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 8px;
`;

const StyledTooltipDataRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTooltipValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
