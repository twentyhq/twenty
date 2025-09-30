import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { IconChartPie, IconFrame, IconList } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { WidgetType } from '~/generated-metadata/graphql';

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
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const setPageLayoutDraggedArea = useSetRecoilComponentState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const handleSelectWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case WidgetType.GRAPH: {
        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
        });

        break;
      }
      case WidgetType.IFRAME: {
        navigatePageLayoutCommandMenu({
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
        const MenuItemComponent = (
          <MenuItem
            withIconContainer={true}
            key={option.type}
            LeftIcon={option.icon}
            text={option.title}
            onClick={() => handleSelectWidget(option.type)}
          />
        );

        return option.disabled ? (
          <StyledDisabledMenuItem key={option.type}>
            {MenuItemComponent}
          </StyledDisabledMenuItem>
        ) : (
          MenuItemComponent
        );
      })}
    </StyledContainer>
  );
};
