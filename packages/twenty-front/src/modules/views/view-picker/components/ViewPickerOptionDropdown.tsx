import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { View } from '@/views/types/View';
import { useDeleteViewFromCurrentState } from '@/views/view-picker/hooks/useDeleteViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconHeart,
  IconLock,
  IconPencil,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type ViewPickerOptionDropdownProps = {
  isIndexView: boolean;
  view: Pick<View, 'id' | 'name' | 'icon' | '__typename'>;
  onEdit: (event: React.MouseEvent<HTMLElement>, viewId: string) => void;
  handleViewSelect: (viewId: string) => void;
};

export const ViewPickerOptionDropdown = ({
  isIndexView,
  onEdit,
  view,
  handleViewSelect,
}: ViewPickerOptionDropdownProps) => {
  const dropdownId = `view-picker-options-${view.id}`;

  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { getIcon } = useIcons();
  const [isHovered, setIsHovered] = useState(false);
  const { deleteViewFromCurrentState } = useDeleteViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );
  const { setViewPickerMode } = useViewPickerMode();

  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();

  const isFavorite = favorites.some(
    (favorite) =>
      favorite.recordId === view.id && favorite.forWorkspaceMemberId,
  );

  const handleDelete = () => {
    setViewPickerReferenceViewId(view.id);
    deleteViewFromCurrentState();
    closeDropdown(dropdownId);
  };

  const handleAddToFavorites = () => {
    if (!isFavorite) {
      createFavorite(view, 'view');
    } else {
      setViewPickerReferenceViewId(view.id);
      setViewPickerMode('favorite-folders-picker');
    }
    closeDropdown(dropdownId);
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
        }}
        dropdownPlacement="bottom-start"
        dropdownId={`view-picker-options-${view.id}`}
        dropdownContent={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {isIndexView ? (
                <MenuItem
                  LeftIcon={IconHeart}
                  text={isFavorite ? t`Manage favorite` : t`Add to Favorite`}
                  onClick={handleAddToFavorites}
                />
              ) : (
                <>
                  <MenuItem
                    LeftIcon={IconHeart}
                    text={isFavorite ? t`Manage favorite` : t`Add to Favorite`}
                    onClick={handleAddToFavorites}
                  />

                  <MenuItem
                    LeftIcon={IconPencil}
                    text={t`Edit`}
                    onClick={(event) => {
                      onEdit(event, view.id);
                      closeDropdown(dropdownId);
                    }}
                  />
                  <MenuItem
                    LeftIcon={IconTrash}
                    text={t`Delete`}
                    onClick={handleDelete}
                    accent="danger"
                  />
                </>
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </>
  );
};
