import { IconButton } from '@/ui/button/components/IconButton';
import { IconHeart } from '@/ui/icon';

type OwnProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export function PageFavoriteButton({ isFavorite, onClick }: OwnProps) {
  return (
    <IconButton
      icon={<IconHeart size={16} />}
      size="medium"
      variant="secondary"
      data-testid="add-button"
      accent={isFavorite ? 'danger' : 'default'}
      onClick={onClick}
    />
  );
}
