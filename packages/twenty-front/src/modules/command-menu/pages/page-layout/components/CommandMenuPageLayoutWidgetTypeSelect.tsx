import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useOpenPageLayoutCommandMenu';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStorePageLayoutIdComponentState } from '@/context-store/states/contextStorePageLayoutIdComponentState';
import { WidgetType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
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
  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  const pageLayoutId = useRecoilComponentValue(
    contextStorePageLayoutIdComponentState,
    commandMenuPageInstanceId,
  );

  if (!pageLayoutId) {
    throw new Error('Page layout id is not defined');
  }

  const setPageLayoutDraggedArea = useSetRecoilComponentState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const handleSelectWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case WidgetType.GRAPH: {
        navigatePageLayoutCommandMenu({
          pageLayoutId,
          commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
        });

        break;
      }
      case WidgetType.IFRAME: {
        navigatePageLayoutCommandMenu({
          pageLayoutId,
          commandMenuPage: CommandMenuPages.PageLayoutIframeConfig,
        });

        break;
      }
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
