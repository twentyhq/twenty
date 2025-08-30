import styled from '@emotion/styled';
import {
  IconChartBar,
  IconChartDots3,
  IconChartPie,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';
import { type GraphSubType } from '../mocks/mockWidgets';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const graphTypeOptions = [
  {
    type: 'number' as GraphSubType,
    icon: IconNumber,
    title: 'Number',
  },
  {
    type: 'gauge' as GraphSubType,
    icon: IconGauge,
    title: 'Gauge',
  },
  {
    type: 'pie' as GraphSubType,
    icon: IconChartPie,
    title: 'Pie Chart',
  },
  {
    type: 'bar' as GraphSubType,
    icon: IconChartBar,
    title: 'Bar Chart',
  },
  {
    type: 'line' as GraphSubType,
    icon: IconChartDots3,
    title: 'Line Chart',
  },
];

type PageLayoutSelectGraphTypeProps = {
  onSelectGraphType: (graphType: GraphSubType) => void;
};

export const PageLayoutSelectGraphType = ({
  onSelectGraphType,
}: PageLayoutSelectGraphTypeProps) => {
  return (
    <StyledContainer>
      <StyledSectionTitle>Graph type</StyledSectionTitle>
      {graphTypeOptions.map((option) => (
        <MenuItemCommand
          key={option.type}
          LeftIcon={option.icon}
          text={option.title}
          onClick={() => onSelectGraphType(option.type)}
        />
      ))}
    </StyledContainer>
  );
};
