import { IconButton } from '@/ui/button/components/IconButton';
import { IconHeart } from '@/ui/icon';

type OwnProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export const PageFavoriteButton = ({ isFavorite, onClick }: OwnProps) => (
  <IconButton
    Icon={IconHeart}
    size="medium"
    variant="secondary"
    data-testid="add-button"
    accent={isFavorite ? 'danger' : 'default'}
    onClick={onClick}
  />
);
