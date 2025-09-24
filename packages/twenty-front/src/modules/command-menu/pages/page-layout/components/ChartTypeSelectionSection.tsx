import { GraphType } from '@/page-layout/mocks/mockWidgets';
import styled from '@emotion/styled';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';
import { MenuPicker } from 'twenty-ui/navigation';

const graphTypeOptions = [
  {
    type: GraphType.BAR,
    icon: IconChartBar,
    title: 'Bar Chart',
  },
  {
    type: GraphType.PIE,
    icon: IconChartPie,
    title: 'Pie Chart',
  },
  {
    type: GraphType.LINE,
    icon: IconChartLine,
    title: 'Line Chart',
  },
  {
    type: GraphType.NUMBER,
    icon: IconNumber,
    title: 'Number',
  },
  {
    type: GraphType.GAUGE,
    icon: IconGauge,
    title: 'Gauge',
  },
];

const StyledChartTypeSelectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ChartTypeSelectionSection = () => {
  return (
    <StyledChartTypeSelectionContainer>
      {graphTypeOptions.map((option) => (
        <MenuPicker
          key={option.type}
          icon={option.icon}
          onClick={() => {}}
          label={option.title}
          showLabel={false}
        />
      ))}
    </StyledChartTypeSelectionContainer>
  );
};
