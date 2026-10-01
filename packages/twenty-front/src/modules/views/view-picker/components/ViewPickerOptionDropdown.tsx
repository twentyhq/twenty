import { Dropdown } from 'twenty-ui/components';
import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
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
  IconHeartOff,
  IconLock,
  IconPencil,
  IconTrash,
  useIcons,
} from 'twenty-ui/icon';
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
  isCurrentView: boolean;
};

export const ViewPickerOptionDropdown = ({
  isIndexView,
  isLastView,
  onEdit,
  view,
  handleViewSelect,
  isCurrentView,
}: ViewPickerOptionDropdownProps) => {
  const dropdownId = `view-picker-options-${view.id}`;

  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
  );
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { navigationMenuItems, currentUserWorkspaceId } =
    useNavigationMenuItemsData();

  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  // Users without VIEWS permission can only edit unlisted views (which are always their own, filtered by backend)
  const canEditView =
    hasViewsPermission || view.visibility === ViewVisibility.UNLISTED;

  const currentNavigationMenuItem = navigationMenuItems.find(
    (item) =>
      item.viewId === view.id &&
      item.userWorkspaceId === currentUserWorkspaceId,
  );
  const isFavorite = isDefined(currentNavigationMenuItem);

  const handleDelete = () => {
    setViewPickerReferenceViewId(view.id);
    destroyViewFromCurrentState();
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      deleteManyNavigationMenuItems([currentNavigationMenuItem.id]);
      return;
    }

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
        userWorkspaceId: currentUserWorkspaceId,
        position: maxPosition + 1,
      },
    ]);
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
        dropdownAlign="start"
        dropdownId={dropdownId}
        selected={isCurrentView}
        dropdownContent={
          <Dropdown.Section>
            <Dropdown.ActionItem
              startIcon={isFavorite ? <IconHeartOff /> : <IconHeart />}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? t`Remove Favorite` : t`Add to Favorite`}
            </Dropdown.ActionItem>
            {!isIndexView && canEditView && (
              <>
                <Dropdown.ActionItem
                  startIcon={<IconPencil />}
                  onClick={(event) => {
                    onEdit(event, view.id);
                  }}
                >{t`Edit`}</Dropdown.ActionItem>
                {!isLastView && (
                  <Dropdown.ActionItem
                    startIcon={<IconTrash />}
                    onClick={handleDelete}
                    color="danger"
                  >{t`Delete`}</Dropdown.ActionItem>
                )}
              </>
            )}
          </Dropdown.Section>
        }
      />
    </>
  );
};
