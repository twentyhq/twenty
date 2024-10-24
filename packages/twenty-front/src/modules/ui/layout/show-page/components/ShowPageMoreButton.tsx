import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconDotsVertical, IconRestore, IconTrash } from 'twenty-ui';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';

import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { Dropdown } from '../../dropdown/components/Dropdown';
import { DropdownMenu } from '../../dropdown/components/DropdownMenu';

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
  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular,
  });
  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular,
  });

  const handleDelete = () => {
    deleteOneRecord(recordId);
    closeDropdown();
  };

  const handleDestroy = () => {
    destroyOneRecord(recordId);
    closeDropdown();
    navigate(navigationMemorizedUrl, { replace: true });
  };

  const handleRestore = () => {
    restoreManyRecords([recordId]);
    closeDropdown();
  };

  const [recordFromStore] = useRecoilState<any>(
    recordStoreFamilyState(recordId),
  );

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
              {recordFromStore && !recordFromStore.deletedAt && (
                <MenuItem
                  onClick={handleDelete}
                  accent="danger"
                  LeftIcon={IconTrash}
                  text="Delete"
                />
              )}
              {recordFromStore && recordFromStore.deletedAt && (
                <>
                  <MenuItem
                    onClick={handleDestroy}
                    accent="danger"
                    LeftIcon={IconTrash}
                    text="Destroy"
                  />
                  <MenuItem
                    onClick={handleRestore}
                    LeftIcon={IconRestore}
                    text="Restore"
                  />
                </>
              )}
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
