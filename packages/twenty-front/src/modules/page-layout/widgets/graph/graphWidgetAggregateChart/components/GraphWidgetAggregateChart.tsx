import { formatNumberChartTrend } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/formatNumberChartTrend';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import {
  H1Title,
  H1TitleFontColor,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';

type GraphWidgetAggregateChartProps = {
  value: string | number;
  trendPercentage?: number;
  prefix?: string;
  suffix?: string;
};

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
  font-size: ${({ theme }) => theme.font.size.xxl};
  margin: 0;
`;

export const GraphWidgetAggregateChart = ({
  value,
  trendPercentage,
  prefix,
  suffix,
}: GraphWidgetAggregateChartProps) => {
  const theme = useTheme();

  const formattedPercentage = isDefined(trendPercentage)
    ? formatNumberChartTrend(trendPercentage)
    : undefined;

  const displayValue = `${prefix ?? ''}${value}${suffix ?? ''}`;

  return (
    <StyledContainer>
      <StyledH1Title
        title={displayValue}
        fontColor={H1TitleFontColor.Primary}
      />
      {isDefined(trendPercentage) && (
        <StyledTrendIconContainer>
          <StyledTrendPercentageValue>
            {formattedPercentage}%
          </StyledTrendPercentageValue>
          {trendPercentage >= 0 ? (
            <IconTrendingUp
              color={theme.color.turquoise8}
              size={theme.icon.size.md}
            />
          ) : (
            <IconTrendingDown
              color={theme.color.red8}
              size={theme.icon.size.md}
            />
          )}
        </StyledTrendIconContainer>
      )}
    </StyledContainer>
  );
};
