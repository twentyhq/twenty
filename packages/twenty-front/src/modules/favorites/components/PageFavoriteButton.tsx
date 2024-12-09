import { Button, IconHeart } from 'twenty-ui';

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
      Icon={IconHeart}
      dataTestId="favorite-button"
      size="small"
      variant="secondary"
      accent={isFavorite ? 'danger' : 'default'}
      title={title}
      onClick={onClick}
      ariaLabel={title}
    />
  );
};
