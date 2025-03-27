import { Button, IconHeart, IconHeartOff } from 'twenty-ui';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
  onClick?: () => void;
};

export const PageFavoriteButton = ({
  isFavorite,
  onClick,
}: PageFavoriteButtonProps) => {
  const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';

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
