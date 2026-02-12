import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { t } from '@lingui/core/macro';
import { MenuPicker } from 'twenty-ui/navigation';

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
  const isDashboardV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
  );

  return (
    <StyledChartTypeSelectionContainer>
      {graphTypeOptions
        .filter(
          (graphType) => isDashboardV2Enabled || graphType !== GraphType.GAUGE,
        )
        .map((graphType) => {
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
