import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { GraphType, WidgetType } from '~/generated-metadata/graphql';
import styled from '@emotion/styled';

import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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
    type: GraphType.GAUGE,
    icon: IconGauge,
    title: 'Gauge',
  },
  {
    type: GraphType.NUMBER,
    icon: IconNumber,
    title: 'Number',
  },
  {
    type: GraphType.LINE,
    icon: IconChartLine,
    title: 'Line Chart',
  },
];

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  const { closeCommandMenu } = useCommandMenu();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { createPageLayoutWidget } =
    useCreatePageLayoutGraphWidget(pageLayoutId);

  const handleSelectGraphType = (graphType: GraphType) => {
    createPageLayoutWidget(WidgetType.GRAPH, graphType);
    closeCommandMenu();
  };

  return (
    <StyledContainer>
      <StyledSectionTitle>Graph type</StyledSectionTitle>

      {graphTypeOptions.map((option) => (
        <MenuItem
          withIconContainer={true}
          key={option.type}
          LeftIcon={option.icon}
          text={option.title}
          onClick={() => handleSelectGraphType(option.type)}
        />
      ))}
    </StyledContainer>
  );
};
