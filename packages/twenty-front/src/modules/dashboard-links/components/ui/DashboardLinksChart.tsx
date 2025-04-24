/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LinklogsChartData } from '~/types/LinkLogs';

const StyledChartContainer = styled.div`
  background-color: #fcfcfc;
  height: 400px;
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  border: 1px solid #ebebeb;
  border-radius: 8px;
`;

interface DashboardLinksChartProps {
  chartData: LinklogsChartData;
}

export const DashboardLinksChart = ({
  chartData: { data, sourceKeyColors },
}: DashboardLinksChartProps) => {
  return (
    <StyledChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          data={data}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.entries(sourceKeyColors).map(([key, color]) => (
            <Bar key={key} dataKey={key} stackId="a" fill={color} name={key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </StyledChartContainer>
  );
};
