import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { MouseEvent, useCallback } from 'react';
import { IconLock, IconPencil, IconPlus, useIcons } from 'twenty-ui';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/navigation/menu-item/components/MenuItemDraggable';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDefined } from '~/utils/isDefined';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ViewPickerListContent = () => {
  const { currentViewWithCombinedFiltersAndSorts, viewsOnCurrentObject } =
    useGetCurrentView();
  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const { setViewPickerMode } = useViewPickerMode();

  const { closeDropdown } = useDropdown(VIEW_PICKER_DROPDOWN_ID);
  const { updateView } = useUpdateView();
  const { changeView } = useChangeView();

  const handleViewSelect = (viewId: string) => {
    changeView(viewId);
    closeDropdown();
  };

  const handleAddViewButtonClick = () => {
    if (isDefined(currentViewWithCombinedFiltersAndSorts?.id)) {
      setViewPickerReferenceViewId(currentViewWithCombinedFiltersAndSorts.id);
      setViewPickerMode('create-empty');
    }
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setViewPickerReferenceViewId(viewId);
    setViewPickerMode('edit');
  };

  const { getIcon } = useIcons();

  const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      moveArrayItem(viewsOnCurrentObject, {
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      }).forEach((view, index) => {
        if (view.position !== index) {
          updateView({ ...view, position: index });
        }
      });
    },
    [updateView, viewsOnCurrentObject],
  );

  return (
    <>
      <DropdownMenuItemsContainer>
        {indexView && (
          <MenuItemDraggable
            key={indexView.id}
            iconButtons={[
              {
                Icon: IconLock,
              },
            ].filter(isDefined)}
            isIconDisplayedOnHoverOnly={false}
            onClick={() => handleViewSelect(indexView.id)}
            LeftIcon={getIcon(indexView.icon)}
            text={indexView.name}
            accent="placeholder"
            isDragDisabled
          />
        )}
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={viewsOnCurrentObject
            .filter((view) => indexView?.id !== view.id)
            .map((view, index) => (
              <DraggableItem
                key={view.id}
                draggableId={view.id}
                index={index}
                isDragDisabled={viewsOnCurrentObject.length === 1}
                itemComponent={
                  <MenuItemDraggable
                    key={view.id}
                    iconButtons={[
                      {
                        Icon: IconPencil,
                        onClick: (event: MouseEvent<HTMLButtonElement>) =>
                          handleEditViewButtonClick(event, view.id),
                      },
                    ].filter(isDefined)}
                    isIconDisplayedOnHoverOnly={
                      indexView?.id === view.id ? false : true
                    }
                    onClick={() => handleViewSelect(view.id)}
                    LeftIcon={getIcon(view.icon)}
                    text={view.name}
                  />
                }
              />
            ))}
        />
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <StyledBoldDropdownMenuItemsContainer>
        <MenuItem
          onClick={handleAddViewButtonClick}
          LeftIcon={IconPlus}
          text="Add view"
        />
      </StyledBoldDropdownMenuItemsContainer>
    </>
  );
};
