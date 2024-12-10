import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Button, IconButton, IconPlus } from 'twenty-ui';

type PageAddButtonProps = {
  onClick?: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => {
  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );
  return (
    <>
      {isPageHeaderV2Enabled ? (
        <Button
          Icon={IconPlus}
          dataTestId="add-button"
          size="small"
          variant="secondary"
          accent="default"
          title="New record"
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
