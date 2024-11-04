import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar, useIcons } from 'twenty-ui';

const StyledAvatar = styled(Avatar)`
  background: inherit;
  :hover {
    cursor: grab;
  }
`;

export const FavoriteIcon = ({ favorite }: { favorite: ProcessedFavorite }) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    favorite.objectNameSingular || '',
  );
  const IconToUse =
    StandardIcon || (favorite.Icon ? getIcon(favorite.Icon) : undefined);
  const iconColorToUse = StandardIcon ? IconColor : theme.font.color.secondary;

  return (
    <StyledAvatar
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
