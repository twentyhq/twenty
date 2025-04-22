import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { ViewPickerContentCreateMode } from '@/views/view-picker/components/ViewPickerContentCreateMode';
import { ViewPickerContentEditMode } from '@/views/view-picker/components/ViewPickerContentEditMode';
import { ViewPickerContentEffect } from '@/views/view-picker/components/ViewPickerContentEffect';
import { ViewPickerFavoriteFoldersDropdown } from '@/views/view-picker/components/ViewPickerFavoriteFoldersDropdown';
import { ViewPickerListContent } from '@/views/view-picker/components/ViewPickerListContent';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconList, useIcons } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledDropdownLabelAdornments = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.grayScale.gray35};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledViewName = styled.span`
  margin-left: ${({ theme }) => theme.spacing(1)};
  display: inline-block;
  max-width: 130px;
  @media (max-width: 375px) {
    max-width: 90px;
  }
  @media (min-width: 376px) and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 110px;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
`;

export const ViewPickerDropdown = () => {
  const theme = useTheme();

  const { currentView } = useGetCurrentViewOnly();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();

  const { totalCount } = useGetRecordIndexTotalCount();

  const { isDropdownOpen: isViewsListDropdownOpen } = useDropdown(
    VIEW_PICKER_DROPDOWN_ID,
  );

  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();

  const { getIcon } = useIcons();
  const CurrentViewIcon = getIcon(currentView?.icon);

  const handleClickOutside = async () => {
    if (isViewsListDropdownOpen && viewPickerMode === 'edit') {
      await updateViewFromCurrentState();
    }
    setViewPickerMode('list');
  };

  return (
    <Dropdown
      dropdownId={VIEW_PICKER_DROPDOWN_ID}
      dropdownHotkeyScope={{ scope: ViewsHotkeyScope.ListDropdown }}
      dropdownOffset={{ x: 0, y: 8 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleClickOutside}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isViewsListDropdownOpen}>
          {currentView && CurrentViewIcon ? (
            <CurrentViewIcon size={theme.icon.size.md} />
          ) : (
            <IconList size={theme.icon.size.md} />
          )}
          <StyledViewName>{currentView?.name ?? 'All'}</StyledViewName>
          <StyledDropdownLabelAdornments>
            {isDefined(totalCount) && <>· {totalCount} </>}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={(() => {
        switch (viewPickerMode) {
          case 'list':
            return <ViewPickerListContent />;
          case 'favorite-folders-picker':
            return <ViewPickerFavoriteFoldersDropdown />;
          case 'create-empty':
          case 'create-from-current':
            return (
              <>
                <ViewPickerContentCreateMode />
                <ViewPickerContentEffect />
              </>
            );
          case 'edit':
            return (
              <>
                <ViewPickerContentEditMode />
                <ViewPickerContentEffect />
              </>
            );
          default:
            return null;
        }
      })()}
    />
  );
};
