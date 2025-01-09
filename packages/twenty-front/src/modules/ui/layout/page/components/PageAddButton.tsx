import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Button, IconButton, IconPlus, useIsMobile } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

type PageAddButtonProps = {
  onClick?: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => {
  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );
  const isMobile = useIsMobile();

  return (
    <>
      {isCommandMenuV2Enabled ? (
        <Button
          Icon={IconPlus}
          dataTestId="add-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          title={isMobile ? '' : 'New record'}
          onClick={onClick}
          ariaLabel="New record"
        />
      ) : (
        <IconButton
          Icon={IconPlus}
          dataTestId="add-button"
          size="medium"
          variant="secondary"
          accent="default"
          ariaLabel="Add"
          onClick={onClick}
        />
      )}
    </>
  );
};
