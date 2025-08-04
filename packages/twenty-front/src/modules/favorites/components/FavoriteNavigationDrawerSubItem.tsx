import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';

type FavoriteNavigationDrawerSubItemProps = {
  favorite: ProcessedFavorite;
  label: string;
  Icon?: React.ComponentProps<typeof NavigationDrawerSubItem>['Icon'];
  to?: string;
  active?: boolean;
  subItemState?: React.ComponentProps<
    typeof NavigationDrawerSubItem
  >['subItemState'];
  rightOptions?: React.ComponentProps<
    typeof NavigationDrawerSubItem
  >['rightOptions'];
  isDragging?: boolean;
  triggerEvent?: React.ComponentProps<
    typeof NavigationDrawerSubItem
  >['triggerEvent'];
};

export const FavoriteNavigationDrawerSubItem = ({
  favorite,
  label,
  Icon,
  to,
  active,
  subItemState,
  rightOptions,
  isDragging,
  triggerEvent,
}: FavoriteNavigationDrawerSubItemProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: favorite.objectNameSingular || '',
  });

  if (!favorite.objectNameSingular) {
    return null;
  }

  return (
    <NavigationDrawerSubItem
      label={label}
      secondaryLabel={objectMetadataItem.labelSingular}
      Icon={Icon}
      to={to}
      active={active}
      subItemState={subItemState}
      rightOptions={rightOptions}
      isDragging={isDragging}
      triggerEvent={triggerEvent}
    />
  );
};
