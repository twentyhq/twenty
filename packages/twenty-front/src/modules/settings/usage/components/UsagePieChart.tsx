import { CHART_MOTION_CONFIG } from '@/page-layout/widgets/graph/constants/ChartMotionConfig';
import { GraphWidgetLegendDot } from '@/page-layout/widgets/graph/components/GraphWidgetLegendDot';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { ResponsivePie } from '@nivo/pie';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type UsagePieChartDatum = {
  id: string;
  value: number;
  color: string;
};

type UsagePieChartProps = {
  data: UsagePieChartDatum[];
};

const StyledContainer = styled.div`
  height: 220px;
  width: 100%;
`;

const StyledTooltip = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTooltipValue = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  white-space: nowrap;
`;

export const UsagePieChart = ({ data }: UsagePieChartProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();

  return (
    <StyledContainer>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.6}
        padAngle={0.5}
        cornerRadius={2}
        colors={data.map((item) => item.color)}
        enableArcLabels={false}
        enableArcLinkLabels={true}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme.font.color.secondary}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLinkLabelsDiagonalLength={10}
        arcLinkLabelsStraightLength={10}
        animate
        motionConfig={CHART_MOTION_CONFIG}
        tooltip={({ datum }) => (
          <StyledTooltip>
            <StyledTooltipRow>
              <GraphWidgetLegendDot color={datum.color} />
              <StyledTooltipLabel>{String(datum.id)}</StyledTooltipLabel>
              <StyledTooltipValue>
                {t`${formatNumber(datum.value)} credits`}
              </StyledTooltipValue>
            </StyledTooltipRow>
          </StyledTooltip>
        )}
      />
    </StyledContainer>
  );
};
