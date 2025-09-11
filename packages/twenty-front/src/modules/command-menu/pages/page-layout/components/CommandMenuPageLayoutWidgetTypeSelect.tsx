import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { WidgetType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutDraggedAreaState } from '@/page-layout/states/pageLayoutDraggedAreaState';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { IconChartPie, IconFrame, IconList } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

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
    disabled: false,
  },
];

export const CommandMenuPageLayoutWidgetTypeSelect = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setPageLayoutDraggedArea = useSetRecoilState(
    pageLayoutDraggedAreaState,
  );

  const handleSelectWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case WidgetType.GRAPH:
        navigateCommandMenu({
          page: CommandMenuPages.PageLayoutGraphTypeSelect,
          pageTitle: 'Select Graph Type',
          pageIcon: IconChartPie,
        });
        break;
      case WidgetType.IFRAME:
        navigateCommandMenu({
          page: CommandMenuPages.PageLayoutIframeConfig,
          pageTitle: 'Configure iFrame',
          pageIcon: IconFrame,
        });
        break;
      default:
        setPageLayoutDraggedArea(null);
        break;
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
            onClick={() => handleSelectWidget(option.type)}
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
