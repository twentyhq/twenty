import { formatNumberChartTrend } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/utils/formatNumberChartTrend';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconTrendingDown, IconTrendingUp } from 'twenty-ui/icon';
import { Heading } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
type GraphWidgetAggregateChartProps = {
  value: string | number;
  trendPercentage?: number;
  prefix?: string;
  suffix?: string;
};

const StyledTrendPercentageValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-inline-end: ${themeCssVariables.spacing[2]};
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`;

const StyledTrendIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledHeadingWrapper = styled.div`
  > h2 {
    font-size: ${themeCssVariables.font.size.xxl};
    margin: 0;
  }
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
      <StyledHeadingWrapper>
        <Heading level={2} size="lg">
          {displayValue}
        </Heading>
      </StyledHeadingWrapper>
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
