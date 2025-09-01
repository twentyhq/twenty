import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { IconChartPie, IconFrame, IconList } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';
import { WidgetType } from '../mocks/mockWidgets';
import {
  selectedWidgetTypeState,
  SidePanelStep,
  sidePanelStepState,
} from '../states/pageLayoutSidePanelState';

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

const StyledDisabledMenuItem = styled.div`
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
`;

const widgetTypeOptions = [
  {
    type: WidgetType.GRAPH,
    icon: IconChartPie,
    title: 'Add a graph',
    disabled: false,
  },
  {
    type: WidgetType.VIEW,
    icon: IconList,
    title: 'Add a view',
    disabled: true,
  },
  {
    type: WidgetType.IFRAME,
    icon: IconFrame,
    title: 'Add an iframe',
    disabled: true,
  },
];

export const PageLayoutSelectWidgetType = () => {
  const setSidePanelStep = useSetRecoilState(sidePanelStepState);
  const setSelectedWidgetType = useSetRecoilState(selectedWidgetTypeState);

  const handleSelectWidgetType = (type: WidgetType) => {
    setSelectedWidgetType(type);

    if (type === WidgetType.GRAPH) {
      setSidePanelStep(SidePanelStep.SELECT_GRAPH_TYPE);
    }
  };

  return (
    <StyledContainer>
      <StyledSectionTitle>Widget type</StyledSectionTitle>
      {widgetTypeOptions.map((option) => {
        const MenuItem = (
          <MenuItemCommand
            key={option.type}
            LeftIcon={option.icon}
            text={option.title}
            onClick={() => handleSelectWidgetType(option.type)}
          />
        );

        return option.disabled ? (
          <StyledDisabledMenuItem key={option.type}>
            {MenuItem}
          </StyledDisabledMenuItem>
        ) : (
          MenuItem
        );
      })}
    </StyledContainer>
  );
};
