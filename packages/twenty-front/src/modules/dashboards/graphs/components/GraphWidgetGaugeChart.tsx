import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { useState } from 'react';
import {
  AppTooltip,
  H1Title,
  H1TitleFontColor,
  IconArrowUpRight,
  TooltipDelay,
} from 'twenty-ui/display';

type GraphWidgetGaugeChartProps = {
  value: number;
  min: number;
  max: number;
  unit: string;
  showValue?: boolean;
  legendLabel: string;
  tooltipHref: string;
  id: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const StyledH1Title = styled(H1Title)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -150%);
`;

const StyledLegendContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLegendLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLegendValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.extraLight};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDot = styled.div`
  background: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

const StyledTooltipValue = styled.span`
  margin-left: auto;
  white-space: nowrap;
`;

const StyledTooltipLink = styled.a`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

export const GraphWidgetGaugeChart = ({
  value,
  min,
  max,
  unit,
  showValue = true,
  legendLabel,
  tooltipHref,
  id,
}: GraphWidgetGaugeChartProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const formatValue = (val: number): string => {
    if (val % 1 !== 0) {
      return val.toFixed(1);
    }
    return val.toString();
  };

  const displayValue = formatValue(value);

  const normalizedValue = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const clampedNormalizedValue = Math.max(0, Math.min(100, normalizedValue));

  const data = [
    {
      id: 'gauge',
      data: [
        { x: 'value', y: clampedNormalizedValue },
        { x: 'empty', y: 100 - clampedNormalizedValue },
      ],
    },
  ];

  const gradientColors = isHovered
    ? {
        start: theme.adaptiveColors.blue4,
        end: theme.adaptiveColors.blue3,
      }
    : {
        start: theme.adaptiveColors.blue2,
        end: theme.adaptiveColors.blue1,
      };

  const gradientId = `gaugeGradient-${id}`;

  const defs = [
    {
      id: gradientId,
      type: 'linearGradient',
      colors: [
        { offset: 0, color: gradientColors.start },
        { offset: 100, color: gradientColors.end },
      ],
    },
  ];

  const tooltipContent = (
    <StyledTooltipContent>
      <StyledTooltipRow>
        <StyledDot />
        <span>{legendLabel}</span>
        <StyledTooltipValue>{`${displayValue}${unit}`}</StyledTooltipValue>
      </StyledTooltipRow>
      <StyledTooltipLink href={tooltipHref}>
        <span>{t`Click to see data`}</span>
        <IconArrowUpRight size={theme.icon.size.sm} />
      </StyledTooltipLink>
    </StyledTooltipContent>
  );

  return (
    <>
      <StyledContainer
        id={id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <StyledChartContainer>
          <ResponsiveRadialBar
            data={data}
            startAngle={-90}
            endAngle={90}
            innerRadius={0.7}
            padding={0.2}
            colors={[`url(#${gradientId})`, theme.background.tertiary]}
            defs={defs}
            fill={[
              {
                match: (d: { x: string }) => d.x === 'value',
                id: gradientId,
              },
            ]}
            enableTracks={false}
            enableRadialGrid={false}
            enableCircularGrid={false}
            enableLabels={false}
            isInteractive={false}
            radialAxisStart={null}
            radialAxisEnd={null}
            circularAxisInner={null}
            circularAxisOuter={null}
          />
          {showValue && (
            <StyledH1Title
              title={`${displayValue}${unit}`}
              fontColor={H1TitleFontColor.Primary}
            />
          )}
        </StyledChartContainer>
        <StyledLegendContainer>
          <StyledLegendItem>
            <StyledDot />
            <StyledLegendLabel>{legendLabel}</StyledLegendLabel>
            <StyledLegendValue>{`${displayValue}${unit}`}</StyledLegendValue>
          </StyledLegendItem>
        </StyledLegendContainer>
      </StyledContainer>
      <AppTooltip
        anchorSelect={`#${id}`}
        place="top-start"
        noArrow
        delay={TooltipDelay.noDelay}
        clickable
      >
        {tooltipContent}
      </AppTooltip>
    </>
  );
};
