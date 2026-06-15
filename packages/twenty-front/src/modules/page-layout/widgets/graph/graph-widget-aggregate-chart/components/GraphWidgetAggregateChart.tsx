import { formatNumberChartTrend } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/utils/formatNumberChartTrend';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  H1Title,
  H1TitleFontColor,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
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
  margin-right: ${themeCssVariables.spacing[2]};
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

const StyledH1TitleWrapper = styled.div`
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
  const { theme } = useContext(ThemeContext);

  const formattedPercentage = isDefined(trendPercentage)
    ? formatNumberChartTrend(trendPercentage)
    : undefined;

  const displayValue = `${prefix ?? ''}${value}${suffix ?? ''}`;

  return (
    <StyledContainer>
      <StyledH1TitleWrapper>
        <H1Title title={displayValue} fontColor={H1TitleFontColor.Primary} />
      </StyledH1TitleWrapper>
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
