import { useGraphData } from '@/analytics/hooks/useGraphData';

import { WebhookAnalyticsTooltip } from '@/analytics/components/WebhookAnalyticsTooltip';
import { useAnalyticsGraphDataState } from '@/analytics/hooks/useAnalyticsGraphDataState';
import { Select } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';
import { Section } from '@react-email/components';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { H2Title } from 'twenty-ui';

const StyledGraphContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 199px;

  padding: ${({ theme }) => theme.spacing(4, 2, 2, 2)};
  width: 496px;
`;
const StyledTitleContainer = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

type AnalyticsActivityGraphProps = {
  recordId: string;
  recordType: string;
  endpointName: string;
};

export const AnalyticsActivityGraph = ({
  recordId,
  recordType,
  endpointName,
}: AnalyticsActivityGraphProps) => {
  const { analyticsState, transformDataFunction } =
    useAnalyticsGraphDataState(endpointName);
  const analytics = useRecoilValue(analyticsState);
  const setAnalyticsGraphData = useSetRecoilState(analyticsState);
  const theme = useTheme();

  const [windowLengthGraphOption, setWindowLengthGraphOption] = useState<
    '7D' | '1D' | '12H' | '4H'
  >('7D');

  const { fetchGraphData } = useGraphData({
    recordId,
    recordType,
    endpointName,
  });

  return (
    <>
      {analytics.length ? (
        <Section>
          <StyledTitleContainer>
            <H2Title
              title="Activity"
              description={`See your ${recordType} activity over time`}
            />
            <Select
              dropdownId={`test-id-${endpointName}-graph`}
              value={windowLengthGraphOption}
              options={[
                { value: '7D', label: 'This week' },
                { value: '1D', label: 'Today' },
                { value: '12H', label: 'Last 12 hours' },
                { value: '4H', label: 'Last 4 hours' },
              ]}
              onChange={(windowLengthGraphOption) => {
                setWindowLengthGraphOption(windowLengthGraphOption);
                fetchGraphData(windowLengthGraphOption).then((graphInput) => {
                  setAnalyticsGraphData(transformDataFunction(graphInput));
                });
              }}
            />
          </StyledTitleContainer>

          <StyledGraphContainer>
            <ResponsiveLine
              data={analytics}
              curve={'monotoneX'}
              enableArea={true}
              colors={(d) => d.color}
              theme={{
                text: {
                  fill: theme.font.color.light,
                  fontSize: theme.font.size.sm,
                  fontFamily: theme.font.family,
                },
                axis: {
                  domain: {
                    line: {
                      stroke: theme.border.color.light,
                    },
                  },
                  ticks: {
                    line: {
                      stroke: theme.border.color.light,
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: theme.border.color.light,
                  },
                },

                crosshair: {
                  line: {
                    stroke: theme.font.color.light,
                    strokeDasharray: '2 2',
                  },
                },
              }}
              margin={{ top: 20, right: 0, bottom: 30, left: 30 }}
              xFormat="time:%Y-%m-%d %H:%M%"
              xScale={{
                type: 'time',
                useUTC: false,
                format: '%Y-%m-%d %H:%M:%S',
                precision: 'hour',
              }}
              defs={[
                {
                  colors: [
                    {
                      color: 'inherit',
                      offset: 0,
                    },
                    {
                      color: 'inherit',
                      offset: 100,
                      opacity: 0,
                    },
                  ],
                  id: 'gradientGraph',
                  type: 'linearGradient',
                },
              ]}
              fill={[
                {
                  id: 'gradientGraph',
                  match: '*',
                },
              ]}
              yScale={{
                type: 'linear',
              }}
              axisBottom={{
                format: '%b %d, %I:%M %p',
                tickValues: 2,
                tickPadding: 5,
                tickSize: 6,
              }}
              axisLeft={{
                tickPadding: 5,
                tickSize: 6,
                tickValues: 4,
              }}
              enableGridX={false}
              lineWidth={1}
              gridYValues={4}
              enablePoints={false}
              isInteractive={true}
              useMesh={true}
              enableSlices={false}
              enableCrosshair={false}
              tooltip={({ point }) => <WebhookAnalyticsTooltip point={point} />} // later add a condition to get different tooltips
            />
          </StyledGraphContainer>
        </Section>
      ) : (
        <></>
      )}
    </>
  );
};
