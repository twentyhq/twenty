import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconChevronDown,
  IconList,
  MOBILE_VIEWPORT,
  useIcons,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { ViewPickerCreateOrEditContent } from '@/views/view-picker/components/ViewPickerCreateOrEditContent';
import { ViewPickerCreateOrEditContentEffect } from '@/views/view-picker/components/ViewPickerCreateOrEditContentEffect';
import { ViewPickerListContent } from '@/views/view-picker/components/ViewPickerListContent';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerPersistView } from '@/views/view-picker/hooks/useViewPickerPersistView';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { isDefined } from '~/utils/isDefined';

import { useViewStates } from '../../hooks/internal/useViewStates';

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

  const { entityCountInCurrentViewState } = useViewStates();

  const { viewPickerIsDirtyState } = useViewPickerStates();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { handleUpdate } = useViewPickerPersistView();

  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState,
  );

  const setViewPickerIsDirty = useSetRecoilState(viewPickerIsDirtyState);

  const { isDropdownOpen: isViewsListDropdownOpen } = useDropdown(
    VIEW_PICKER_DROPDOWN_ID,
  );

  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();

  const { getIcon } = useIcons();
  const CurrentViewIcon = getIcon(currentViewWithCombinedFiltersAndSorts?.icon);

  const handleClickOutside = async () => {
    setViewPickerIsDirty(false);
    if (isViewsListDropdownOpen && viewPickerMode === 'edit') {
      await handleUpdate();
    }
    setViewPickerMode('list');
  };

  return (
    <Dropdown
      dropdownId={VIEW_PICKER_DROPDOWN_ID}
      dropdownHotkeyScope={{ scope: ViewsHotkeyScope.ListDropdown }}
      dropdownOffset={{ x: 0, y: 8 }}
      dropdownMenuWidth={200}
      onClickOutside={handleClickOutside}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isViewsListDropdownOpen}>
          {currentViewWithCombinedFiltersAndSorts && CurrentViewIcon ? (
            <CurrentViewIcon size={theme.icon.size.md} />
          ) : (
            <IconList size={theme.icon.size.md} />
          )}
          <StyledViewName>
            {currentViewWithCombinedFiltersAndSorts?.name ?? 'All'}
          </StyledViewName>
          <StyledDropdownLabelAdornments>
            {isDefined(entityCountInCurrentView) && (
              <>· {entityCountInCurrentView} </>
            )}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        viewPickerMode === 'list' ? (
          <ViewPickerListContent />
        ) : (
          <>
            <ViewPickerCreateOrEditContent />
            <ViewPickerCreateOrEditContentEffect />
          </>
        )
      }
    />
  );
};
