import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { styled } from '@linaria/react';

import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { t } from '@lingui/core/macro';
import { ChartTypeChoice } from '@/side-panel/pages/page-layout/components/ChartTypeChoice';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const graphTypeOptions = [
  GraphType.VERTICAL_BAR,
  GraphType.HORIZONTAL_BAR,
  GraphType.LINE,
  GraphType.PIE,
  GraphType.AGGREGATE,
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
          <ChartTypeChoice
            selected={currentGraphType === graphType}
            key={graphType}
            icon={GRAPH_TYPE_INFORMATION[graphType].icon}
            onClick={() => {
              setCurrentGraphType(graphType);
            }}
            label={t(GRAPH_TYPE_INFORMATION[graphType].label)}
          />
        );
      })}
    </StyledChartTypeSelectionContainer>
  );
};
