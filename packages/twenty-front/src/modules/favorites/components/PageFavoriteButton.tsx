import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Button, IconButton, IconHeart, IconHeartOff } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

type PageFavoriteButtonProps = {
  isFavorite: boolean;
  onClick?: () => void;
};

export const PageFavoriteButton = ({
  isFavorite,
  onClick,
}: PageFavoriteButtonProps) => {
  const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPageHeaderV2Enabled,
  );

  return (
    <>
      {isPageHeaderV2Enabled ? (
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
      ) : (
        <IconButton
          Icon={IconHeart}
          size="medium"
          variant="secondary"
          data-testid="add-button"
          accent={isFavorite ? 'danger' : 'default'}
          onClick={onClick}
        />
      )}
    </>
  );
};
