import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type View } from '@/views/types/View';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import {
  IconHeart,
  IconLock,
  IconPencil,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { PermissionFlagType } from '~/generated/graphql';

type ViewPickerOptionDropdownProps = {
  isIndexView: boolean;
  view: Pick<
    View,
    | 'id'
    | 'name'
    | 'icon'
    | '__typename'
    | 'visibility'
    | 'createdByUserWorkspaceId'
  >;
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
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );
  const { setViewPickerMode } = useViewPickerMode();
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);

  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();

  // Users with VIEWS permission can edit all views
  // Users without VIEWS permission can only edit unlisted views (which are always their own, filtered by backend)
  const canEditView =
    hasViewsPermission || view.visibility === ViewVisibility.UNLISTED;

  const isFavorite = favorites.some(
    (favorite) =>
      favorite.recordId === view.id && favorite.forWorkspaceMemberId,
  );

  const handleDelete = () => {
    setViewPickerReferenceViewId(view.id);
    destroyViewFromCurrentState();
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

  const getVisibilityIcon = () => {
    if (isIndexView) {
      return IconLock;
    }

    return null;
  };

  const shouldShowIconAlways = isIndexView;

  return (
    <>
      <MenuItemWithOptionDropdown
        text={view.name}
        LeftIcon={getIcon(view.icon)}
        onClick={() => handleViewSelect(view.id)}
        isIconDisplayedOnHoverOnly={!shouldShowIconAlways}
        RightIcon={getVisibilityIcon()}
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

                  {canEditView && (
                    <>
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
                </>
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </>
  );
};
