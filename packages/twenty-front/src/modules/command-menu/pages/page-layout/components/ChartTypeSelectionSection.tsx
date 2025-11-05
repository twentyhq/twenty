import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { FeatureFlagKey, GraphType } from '~/generated-metadata/graphql';

import { t } from '@lingui/core/macro';
import { MenuPicker } from 'twenty-ui/navigation';

const graphTypeOptions = [
  GraphType.VERTICAL_BAR,
  GraphType.HORIZONTAL_BAR,
  GraphType.AGGREGATE,
  GraphType.PIE,
  GraphType.LINE,
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
      {graphTypeOptions.map((graphType) => {
        const isChartV2Type = [
          GraphType.PIE,
          GraphType.LINE,
          GraphType.GAUGE,
        ].includes(graphType);

        const isDisabled = isChartV2Type && !isDashboardV2Enabled;

        return (
          <MenuPicker
            selected={currentGraphType === graphType}
            key={graphType}
            icon={GRAPH_TYPE_INFORMATION[graphType].icon}
            onClick={() => {
              setCurrentGraphType(graphType);
            }}
            label={
              isDisabled ? t`Soon` : t(GRAPH_TYPE_INFORMATION[graphType].label)
            }
            showLabel
            disabled={isDisabled}
          />
        );
      })}
    </StyledChartTypeSelectionContainer>
  );
};
