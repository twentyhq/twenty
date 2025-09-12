import { type NumberChartData } from '@/page-layout/widgets/graph/graphWidgetNumberChart/types/NumberChartData';
import { formatNumberChartTrend } from '@/page-layout/widgets/graph/graphWidgetNumberChart/utils/formatNumberChartTrend';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  H1Title,
  H1TitleFontColor,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';

type GraphWidgetNumberChartProps = NumberChartData;

const StyledTrendPercentageValue = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`;

const StyledTrendIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledH1Title = styled(H1Title)`
  margin: 0;
`;

export const GraphWidgetNumberChart = ({
  value,
  trendPercentage,
}: GraphWidgetNumberChartProps) => {
  const theme = useTheme();
  const formattedPercentage = formatNumberChartTrend(trendPercentage);

  return (
    <StyledContainer>
      <StyledH1Title title={value} fontColor={H1TitleFontColor.Primary} />
      <StyledTrendIconContainer>
        <StyledTrendPercentageValue>
          {formattedPercentage}%
        </StyledTrendPercentageValue>
        {trendPercentage >= 0 ? (
          <IconTrendingUp
            color={theme.color.turquoise40}
            size={theme.icon.size.md}
          />
        ) : (
          <IconTrendingDown color={theme.color.red} size={theme.icon.size.md} />
        )}
      </StyledTrendIconContainer>
    </StyledContainer>
  );
};
