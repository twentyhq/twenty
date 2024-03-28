import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItemsContainer,
  IconButton,
  IconDotsVertical,
  IconTrash,
  MenuItem,
  navigationMemorizedUrlState,
  useDropdown,
} from 'twenty-ui';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';

const StyledContainer = styled.div`
  z-index: 1;
`;

export const ShowPageMoreButton = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const { closeDropdown, toggleDropdown } = useDropdown('more-show-page');
  const navigationMemorizedUrl = useRecoilValue(navigationMemorizedUrlState);
  const navigate = useNavigate();

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular,
  });

  const handleDelete = () => {
    deleteOneRecord(recordId);
    closeDropdown();
    navigate(navigationMemorizedUrl, { replace: true });
  };

  return (
    <StyledContainer>
      <Dropdown
        dropdownId="more-show-page"
        clickableComponent={
          <IconButton
            Icon={IconDotsVertical}
            size="medium"
            dataTestId="more-showpage-button"
            accent="default"
            variant="secondary"
            onClick={toggleDropdown}
          />
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              <MenuItem
                onClick={handleDelete}
                accent="danger"
                LeftIcon={IconTrash}
                text="Delete"
              />
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: PageHotkeyScope.ShowPage,
        }}
      />
    </StyledContainer>
  );
};
