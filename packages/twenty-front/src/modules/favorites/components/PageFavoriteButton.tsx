import { Button, IconHeart } from 'twenty-ui';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
  onClick?: () => void;
};

export const PageFavoriteButton = ({
  isFavorite,
  onClick,
}: PageFavoriteButtonProps) => (
  <Button
    Icon={IconHeart}
    dataTestId="favorite-button"
    size="small"
    variant="secondary"
    accent={isFavorite ? 'danger' : 'default'}
    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    onClick={onClick}
    ariaLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  />
);
