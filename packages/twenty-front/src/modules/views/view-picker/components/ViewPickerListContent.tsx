import { MouseEvent } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { IconLock, IconPencil, IconPlus } from 'twenty-ui';

import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
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

  return (
    <>
      <DropdownMenuItemsContainer>
        {viewsOnCurrentObject.map((view) => (
          <MenuItem
            key={view.id}
            iconButtons={[
              view.key !== 'INDEX'
                ? {
                    Icon: IconPencil,
                    onClick: (event: MouseEvent<HTMLButtonElement>) =>
                      handleEditViewButtonClick(event, view.id),
                  }
                : {
                    Icon: IconLock,
                  },
            ].filter(isDefined)}
            isIconDisplayedOnHoverOnly={view.key !== 'INDEX'}
            onClick={() => handleViewSelect(view.id)}
            LeftIcon={getIcon(view.icon)}
            text={view.name}
          />
        ))}
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
