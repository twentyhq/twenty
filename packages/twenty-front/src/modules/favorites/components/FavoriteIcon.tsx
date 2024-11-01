import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar, isDefined, useIcons } from 'twenty-ui';

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAvatar = styled(Avatar)`
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

  if (isDefined(favorite.objectNameSingular) && isDefined(StandardIcon)) {
    return (
      <StyledIconWrapper>
        <StandardIcon color={IconColor} size={theme.icon.size.md} />
      </StyledIconWrapper>
    );
  }

  if (isDefined(favorite.Icon)) {
    const IconComponent = getIcon(favorite.Icon);
    return (
      <StyledIconWrapper>
        <IconComponent size={theme.icon.size.md} />
      </StyledIconWrapper>
    );
  }

  return (
    <StyledIconWrapper>
      <StyledAvatar
        placeholderColorSeed={favorite.recordId}
        avatarUrl={favorite.avatarUrl}
        type={favorite.avatarType}
        placeholder={favorite.labelIdentifier}
        className="unorganised-fav-avatar"
      />
    </StyledIconWrapper>
  );
};
