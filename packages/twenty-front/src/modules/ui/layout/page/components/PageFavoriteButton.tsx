import { IconHeart } from 'twenty-ui';

import { IconButton } from '@/ui/input/button/components/IconButton';

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
