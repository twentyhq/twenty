import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { useDeleteViewFromCurrentState } from '@/views/view-picker/hooks/useDeleteViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useState } from 'react';
import {
  IconHeart,
  IconLock,
  IconPencil,
  IconTrash,
  MenuItem,
  useIcons,
} from 'twenty-ui';

type ViewPickerOptionDropdownProps = {
  isIndexView: boolean;
  view: View;
  onEdit: (event: React.MouseEvent<HTMLElement>, viewId: string) => void;
  handleViewSelect: (viewId: string) => void;
};

export const ViewPickerOptionDropdown = ({
  isIndexView,
  onEdit,
  view,
  handleViewSelect,
}: ViewPickerOptionDropdownProps) => {
  const { closeDropdown } = useDropdown(`view-picker-options-${view.id}`);
  const { getIcon } = useIcons();
  const [isHovered, setIsHovered] = useState(false);
  const { deleteViewFromCurrentState } = useDeleteViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );
  const { setViewPickerMode } = useViewPickerMode();

  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();

  const isFavorite = favorites.some(
    (favorite) => favorite.recordId === view.id && favorite.workspaceMemberId,
  );

  const handleDelete = () => {
    setViewPickerReferenceViewId(view.id);
    deleteViewFromCurrentState();
    closeDropdown();
  };

  const handleAddToFavorites = () => {
    if (!isFavorite) {
      createFavorite(view, 'view');
    } else {
      setViewPickerReferenceViewId(view.id);
      setViewPickerMode('favorite-folders-picker');
    }
    closeDropdown();
  };

  return (
    <>
      <MenuItemWithOptionDropdown
        text={view.name}
        LeftIcon={getIcon(view.icon)}
        onClick={() => handleViewSelect(view.id)}
        isIconDisplayedOnHoverOnly={!isIndexView}
        RightIcon={!isHovered && isIndexView ? IconLock : null}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          closeDropdown();
        }}
        dropdownPlacement="bottom-start"
        dropdownId={`view-picker-options-${view.id}`}
        dropdownContent={
          <DropdownMenuItemsContainer>
            {isIndexView ? (
              <MenuItem
                LeftIcon={IconHeart}
                text={isFavorite ? 'Manage favorite' : 'Add to Favorite'}
                onClick={handleAddToFavorites}
              />
            ) : (
              <>
                <MenuItem
                  LeftIcon={IconHeart}
                  text={isFavorite ? 'Manage favorite' : 'Add to Favorite'}
                  onClick={handleAddToFavorites}
                />

                <MenuItem
                  LeftIcon={IconPencil}
                  text="Edit"
                  onClick={(event) => {
                    onEdit(event, view.id);
                    closeDropdown();
                  }}
                />
                <MenuItem
                  LeftIcon={IconTrash}
                  text="Delete"
                  onClick={handleDelete}
                  accent="danger"
                />
              </>
            )}
          </DropdownMenuItemsContainer>
        }
      />
    </>
  );
};
