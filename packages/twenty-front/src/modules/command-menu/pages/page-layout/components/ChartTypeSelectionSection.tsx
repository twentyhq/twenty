import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import styled from '@emotion/styled';
import { GraphType } from '~/generated-metadata/graphql';

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
          key={GRAPH_TYPE_INFORMATION[graphType].label}
          icon={GRAPH_TYPE_INFORMATION[graphType].icon}
          onClick={() => {
            setCurrentGraphType(graphType);
          }}
          label={GRAPH_TYPE_INFORMATION[graphType].label}
          showLabel={false}
        />
      ))}
    </StyledChartTypeSelectionContainer>
  );
};
