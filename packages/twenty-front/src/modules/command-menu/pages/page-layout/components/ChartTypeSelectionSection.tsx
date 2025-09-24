import { GraphTypeInfo } from '@/command-menu/pages/page-layout/components/GraphTypeInfo';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import styled from '@emotion/styled';

import { MenuPicker } from 'twenty-ui/navigation';

const graphTypeOptions = [
  GraphType.BAR,
  GraphType.PIE,
  GraphType.LINE,
  GraphType.NUMBER,
  GraphType.GAUGE,
];

const StyledChartTypeSelectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type ChartTypeSelectionSectionProps = {
  currentGraphType: GraphType;
  setCurrentGraphType: (graphType: GraphType) => void;
};

export const ChartTypeSelectionSection = ({
  currentGraphType,
  setCurrentGraphType,
}: ChartTypeSelectionSectionProps) => {
  return (
    <StyledChartTypeSelectionContainer>
      {graphTypeOptions.map((graphType) => (
        <MenuPicker
          selected={currentGraphType === graphType}
          key={GraphTypeInfo[graphType].label}
          icon={GraphTypeInfo[graphType].icon}
          onClick={() => {
            setCurrentGraphType(graphType);
          }}
          label={GraphTypeInfo[graphType].label}
          showLabel={false}
        />
      ))}
    </StyledChartTypeSelectionContainer>
  );
};
