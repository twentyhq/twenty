import { IconButton, IconHeart } from 'twenty-ui';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export const PageFavoriteButton = ({
  isFavorite,
  onClick,
}: PageFavoriteButtonProps) => (
  <IconButton
    Icon={IconHeart}
    size="medium"
    variant="secondary"
    data-testid="add-button"
    accent={isFavorite ? 'danger' : 'default'}
    onClick={onClick}
  />
);
