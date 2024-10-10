import { webhookGraphDataState } from '@/settings/developers/webhook/states/webhookGraphDataState';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';
import { Section } from '@react-email/components';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'twenty-ui';

export type NivoLineInput = {
  id: string | number;
  color?: string;
  data: Array<{
    x: number | string | Date;
    y: number | string | Date;
  }>;
};
const StyledGraphContainer = styled.div`
  height: 200px;
  width: 100%;
`;
export const SettingsDeveloppersWebhookUsageGraph = () => {
  const webhookGraphData = useRecoilValue(webhookGraphDataState);

  return (
    <>
      {webhookGraphData.length ? (
        <Section>
          <H2Title title="Statistics" />
          <StyledGraphContainer>
            <ResponsiveLine
              data={webhookGraphData}
              colors={(d) => d.color}
              margin={{ top: 0, right: 0, bottom: 50, left: 60 }}
              xFormat="time:%Y-%m-%d %H:%M%"
              xScale={{
                type: 'time',
                useUTC: false,
                format: '%Y-%m-%d %H:%M:%S',
                precision: 'hour',
              }}
              yScale={{
                type: 'linear',
              }}
              axisBottom={{
                tickValues: 'every day',
                format: '%b %d',
              }}
              enableTouchCrosshair={true}
              enableGridY={false}
              enableGridX={false}
              enablePoints={false}
            />
          </StyledGraphContainer>
        </Section>
      ) : (
        <></>
      )}
    </>
  );
};
