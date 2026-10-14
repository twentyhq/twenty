import { useViewWidgetSelectableViews } from '@/page-layout/widgets/view/hooks/useViewWidgetSelectableViews';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { t } from '@lingui/core/macro';
import { ListItemButton, MenuItem } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

export const ViewWidgetViewDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();
  const { getIcon } = useIcons();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { selectableViews } = useViewWidgetSelectableViews(
    widgetInEditMode?.objectMetadataId,
  );

  const currentViewId = widgetInEditMode
    ? getWidgetConfigurationViewId(widgetInEditMode.configuration)
    : null;

  const handleSelectView = (viewId: string) => {
    updateCurrentWidgetConfig({ configToUpdate: { viewId } });
    closeDropdown();
  };

  if (selectableViews.length === 0) {
    return (
      <DropdownMenuItemsContainer>
        <MenuItem text={t`No shared views for this object`} />
      </DropdownMenuItemsContainer>
    );
  }

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={selectableViews.map((view) => view.id)}
      >
        {selectableViews.map((view) => (
          <SelectableListItem
            key={view.id}
            itemId={view.id}
            onEnter={() => handleSelectView(view.id)}
          >
            <ListItemButton
              focused={selectedItemId === view.id}
              onClick={() => handleSelectView(view.id)}
              role="option"
              aria-selected={currentViewId === view.id}
              selected={currentViewId === view.id}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={getIcon(view.icon)} />}
            >
              {view.name}
            </ListItemButton>
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
