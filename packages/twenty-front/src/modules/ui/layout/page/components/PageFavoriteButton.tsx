import { IconButton, IconHeart } from 'twenty-ui';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
};

export const PageFavoriteButton = ({ isFavorite }: PageFavoriteButtonProps) => (
  <IconButton
    Icon={IconHeart}
    size="medium"
    variant="secondary"
    data-testid="add-button"
    accent={isFavorite ? 'danger' : 'default'}
  />
);
