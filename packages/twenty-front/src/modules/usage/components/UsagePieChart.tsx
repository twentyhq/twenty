import { CHART_MOTION_CONFIG } from '@/page-layout/widgets/graph/constants/ChartMotionConfig';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { ResponsivePie } from '@nivo/pie';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
          <div>{`${String(datum.id)}: ${t`${formatNumber(datum.value)} credits`}`}</div>
        )}
      />
    </StyledContainer>
  );
};
