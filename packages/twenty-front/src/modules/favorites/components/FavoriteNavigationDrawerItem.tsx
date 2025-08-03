import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type FavoriteNavigationDrawerItemProps = {
  favorite: ProcessedFavorite;
  label: string;
  Icon?: React.ComponentProps<typeof NavigationDrawerItem>['Icon'];
  to?: string;
  active?: boolean;
  rightOptions?: React.ComponentProps<
    typeof NavigationDrawerItem
  >['rightOptions'];
  isDragging?: boolean;
  triggerEvent?: React.ComponentProps<
    typeof NavigationDrawerItem
  >['triggerEvent'];
};

export const FavoriteNavigationDrawerItem = ({
  favorite,
  label,
  Icon,
  to,
  active,
  rightOptions,
  isDragging,
  triggerEvent,
}: FavoriteNavigationDrawerItemProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: favorite.objectNameSingular || '',
  });

  if (!favorite.objectNameSingular) {
    return null;
  }

  return (
    <NavigationDrawerItem
      label={label}
      secondaryLabel={objectMetadataItem.labelSingular}
      Icon={Icon}
      to={to}
      active={active}
      rightOptions={rightOptions}
      isDragging={isDragging}
      triggerEvent={triggerEvent}
    />
  );
};
