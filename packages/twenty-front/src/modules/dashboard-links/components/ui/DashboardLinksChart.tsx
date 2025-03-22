/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
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

const StyledChartContainer = styled.div`
  background-color: #fcfcfc;
  height: 400px;
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  border: 1px solid #ebebeb;
  border-radius: 8px;
`;

type ChartData = ChartDataItem[];

interface DashboardLinksChartProps {
  chartData: ChartData;
}

export const DashboardLinksChart = ({
  chartData,
}: DashboardLinksChartProps) => {
  const theme = useTheme();
  const fillColor = '#8884d8';
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
          data={chartData}
        >
          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar dataKey="uv" fill={fillColor} name="Acessos por Fonte" />
        </BarChart>
      </ResponsiveContainer>
    </StyledChartContainer>
  );
};
