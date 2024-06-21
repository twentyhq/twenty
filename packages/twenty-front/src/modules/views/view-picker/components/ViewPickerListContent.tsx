import { MouseEvent, useCallback } from 'react';
import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { useSetRecoilState } from 'recoil';
import { IconLock, IconPencil, IconPlus, useIcons } from 'twenty-ui';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/navigation/menu-item/components/MenuItemDraggable';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDefined } from '~/utils/isDefined';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ViewPickerListContent = () => {
  const { selectView } = useHandleViews();

  const { currentViewWithCombinedFiltersAndSorts, viewsOnCurrentObject } =
    useGetCurrentView();

  const { viewPickerReferenceViewIdState } = useViewPickerStates();
  const setViewPickerReferenceViewId = useSetRecoilState(
    viewPickerReferenceViewIdState,
  );

  const { setViewPickerMode } = useViewPickerMode();

  const { closeDropdown } = useDropdown(VIEW_PICKER_DROPDOWN_ID);

  const { updateView } = useHandleViews();

  const handleViewSelect = (viewId: string) => {
    selectView(viewId);
    closeDropdown();
  };

  const handleAddViewButtonClick = () => {
    if (isDefined(currentViewWithCombinedFiltersAndSorts?.id)) {
      setViewPickerReferenceViewId(currentViewWithCombinedFiltersAndSorts.id);
      setViewPickerMode('create');
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
  const viewsOnCurrentObjectWithoutIndex = viewsOnCurrentObject.filter(
    (view) => view.key !== 'INDEX',
  );

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
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={viewsOnCurrentObjectWithoutIndex.map(
            (view, index) => (
              <DraggableItem
                key={view.id}
                draggableId={view.id}
                index={index}
                isDragDisabled={viewsOnCurrentObjectWithoutIndex.length === 1}
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
                    isIconDisplayedOnHoverOnly
                    onClick={() => handleViewSelect(view.id)}
                    LeftIcon={getIcon(view.icon)}
                    text={view.name}
                  />
                }
              />
            ),
          )}
        />
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
