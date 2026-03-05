import { type ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { Avatar, useIcons } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const FavoriteIcon = ({ favorite }: { favorite: ProcessedFavorite }) => {
  const { getIcon } = useIcons();
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    favorite.objectNameSingular || '',
  );
  const IconToUse =
    StandardIcon || (favorite.Icon ? getIcon(favorite.Icon) : undefined);
  const iconColorToUse = StandardIcon
    ? IconColor
    : resolveThemeVariable(themeCssVariables.font.color.secondary);

  return (
    <Avatar
      size="md"
      type={favorite.avatarType}
      Icon={IconToUse}
      iconColor={iconColorToUse}
      avatarUrl={favorite.avatarUrl}
      placeholder={favorite.labelIdentifier}
      placeholderColorSeed={favorite.recordId}
    />
  );
};
