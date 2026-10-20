import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { styled } from '@linaria/react';

import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const GRAPH_TYPE_OPTIONS = [
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

const StyledChartTypeButton = styled(Button)`
  background: transparent;
  border-color: ${themeCssVariables.border.color.medium};
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  padding-inline: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &[aria-pressed='true'] {
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.color.blue};

    &:hover {
      background: ${themeCssVariables.background.transparent.primary};
    }
  }
`;

type ChartTypeSelectionSectionProps = {
  currentGraphType: GraphType;
  setCurrentGraphType: (graphType: GraphType) => void;
};

export const ChartTypeSelectionSection = ({
  currentGraphType,
  setCurrentGraphType,
}: ChartTypeSelectionSectionProps) => {
  const theme = useTheme();

  return (
    <StyledChartTypeSelectionContainer role="group" aria-label={t`Chart type`}>
      {GRAPH_TYPE_OPTIONS.map((graphType) => {
        const Icon = GRAPH_TYPE_INFORMATION[graphType].icon;
        const label = t(GRAPH_TYPE_INFORMATION[graphType].label);

        return (
          <Tooltip
            key={graphType}
            content={label}
            side="bottom"
            sideOffset={theme.spacingMultiplicator}
            positionMethod="fixed"
            delay={0}
          >
            <StyledChartTypeButton
              id={graphType}
              fullWidth
              aria-label={label}
              aria-pressed={currentGraphType === graphType}
              onClick={() => {
                setCurrentGraphType(graphType);
              }}
            >
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
            </StyledChartTypeButton>
          </Tooltip>
        );
      })}
    </StyledChartTypeSelectionContainer>
  );
};
