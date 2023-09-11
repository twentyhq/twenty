import { IconButton } from '@/ui/button/components/IconButton';
import { IconHeart } from '@/ui/icon';

type OwnProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export function PageFavoriteButton({ isFavorite, onClick }: OwnProps) {
  return (
    <IconButton
      Icon={IconHeart}
      size="medium"
      variant="secondary"
      data-testid="add-button"
      accent={isFavorite ? 'danger' : 'default'}
      onClick={onClick}
    />
  );
}
