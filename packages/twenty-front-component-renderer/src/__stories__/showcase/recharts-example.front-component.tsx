import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { defineFrontComponent } from 'twenty-sdk/define';

const CHART_DATA = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5200 },
  { month: 'Apr', revenue: 4780 },
  { month: 'May', revenue: 5890 },
  { month: 'Jun', revenue: 6390 },
];

const RechartsExampleComponent = () => (
  <div
    data-testid="recharts-component"
    style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
  >
    <AreaChart width={480} height={280} data={CHART_DATA}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Area
        type="monotone"
        dataKey="revenue"
        stroke="#2563eb"
        fill="#bfdbfe"
        isAnimationActive={false}
      />
    </AreaChart>
  </div>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-recharts-example-00-0000-000000000004',
  name: 'recharts-example-component',
  description: 'Front component rendering a fixed size recharts area chart',
  component: RechartsExampleComponent,
});
