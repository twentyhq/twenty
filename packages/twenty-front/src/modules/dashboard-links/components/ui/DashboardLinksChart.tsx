/* eslint-disable @nx/workspace-no-hardcoded-colors */
/* eslint-disable @nx/workspace-styled-components-prefixed-with-styled */
/* eslint-disable prettier/prettier */
// src/modules/dashboard-links/components/ui/DashboardLinksChart.tsx
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

const ChartContainer = styled.div`
  background-color: #fcfcfc;
  height: 400px;
  padding: ${({ theme }: any) => theme.spacing(2)};
  width: 100%;
  border: 1px solid #EBEBEB; 
  border-radius: 8px;
`;

const data = [
  { name: 'Google Ads', 
    uv: 3490,
    pv: 4300,
    amt: 2100, 
  },
  { name: 'Facebook Ads', 
    uv: 3490,
    pv: 4300,
    amt: 2100, 
  },
  { name: 'Twitter Ads', 
    uv: 3490,
    pv: 4300,
    amt: 2100, 
  },
];

export const DashboardLinksChart = () => {
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
          stackId="a"
            dataKey="pv" 
            fill="#8884d8" 
          />
          <Bar 
          stackId="a"
            dataKey="uv" 
            fill="#82ca9d" 
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
