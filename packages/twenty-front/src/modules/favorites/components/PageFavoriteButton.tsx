import { t } from '@lingui/core/macro';
import { IconHeart, IconHeartOff } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
  onClick?: () => void;
};

export const PageFavoriteButton = ({
  isFavorite,
  onClick,
}: PageFavoriteButtonProps) => {
  const title = isFavorite ? t`Remove from favorites` : t`Add to favorites`;

  return (
    <Button
      Icon={isFavorite ? IconHeartOff : IconHeart}
      dataTestId="favorite-button"
      size="small"
      variant="secondary"
      accent="default"
      title={title}
      onClick={onClick}
      ariaLabel={title}
    />
  );
};
