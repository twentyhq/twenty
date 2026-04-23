import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  IconHeart,
  IconLock,
  IconPencil,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import {
  PermissionFlagType,
  ViewVisibility,
} from '~/generated-metadata/graphql';

type ViewPickerOptionDropdownProps = {
  isIndexView: boolean;
  isLastView: boolean;
  view: Pick<
    View,
    'id' | 'name' | 'icon' | 'visibility' | 'createdByUserWorkspaceId'
  >;
  onEdit: (event: React.MouseEvent<HTMLElement>, viewId: string) => void;
  handleViewSelect: (viewId: string) => void;
};

export const ViewPickerOptionDropdown = ({
  isIndexView,
  isLastView,
  onEdit,
  view,
  handleViewSelect,
}: ViewPickerOptionDropdownProps) => {
  const dropdownId = `view-picker-options-${view.id}`;

  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { getIcon } = useIcons();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
  );
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  // Users with VIEWS permission can edit all views
  // Users without VIEWS permission can only edit unlisted views (which are always their own, filtered by backend)
  const canEditView =
    hasViewsPermission || view.visibility === ViewVisibility.UNLISTED;

  const isFavorite = navigationMenuItems.some(
    (item) =>
      item.viewId === view.id &&
      item.userWorkspaceId === currentWorkspaceMemberId,
  );

  const handleDelete = () => {
    setViewPickerReferenceViewId(view.id);
    destroyViewFromCurrentState();
    closeDropdown(dropdownId);
  };

  const handleAddToFavorites = () => {
    if (!isFavorite) {
      const relevantItems = navigationMenuItems.filter(
        (item) => !isDefined(item.folderId) && isDefined(item.userWorkspaceId),
      );

      const maxPosition = Math.max(
        ...relevantItems.map((item) => item.position),
        0,
      );

      createManyNavigationMenuItems([
        {
          id: uuidv4(),
          type: NavigationMenuItemType.VIEW,
          viewId: view.id,
          userWorkspaceId: currentWorkspaceMemberId,
          position: maxPosition + 1,
        },
      ]);
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
                      {!isLastView && (
                        <MenuItem
                          LeftIcon={IconTrash}
                          text={t`Delete`}
                          onClick={handleDelete}
                          accent="danger"
                        />
                      )}
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
