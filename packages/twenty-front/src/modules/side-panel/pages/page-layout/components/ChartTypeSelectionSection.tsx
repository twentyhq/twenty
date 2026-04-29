import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { styled } from '@linaria/react';

import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { t } from '@lingui/core/macro';
import { MenuPicker } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const graphTypeOptions = [
  GraphType.VERTICAL_BAR,
  GraphType.HORIZONTAL_BAR,
  GraphType.LINE,
  GraphType.PIE,
  GraphType.AGGREGATE,
  GraphType.GAUGE,
];

const StyledChartTypeSelectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
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
      {graphTypeOptions.map((graphType) => {
        return (
          <MenuPicker
            id={graphType}
            selected={currentGraphType === graphType}
            key={graphType}
            icon={GRAPH_TYPE_INFORMATION[graphType].icon}
            onClick={() => {
              setCurrentGraphType(graphType);
            }}
            showLabel
            tooltipContent={t(GRAPH_TYPE_INFORMATION[graphType].label)}
          />
        );
      })}
    </StyledChartTypeSelectionContainer>
  );
};
