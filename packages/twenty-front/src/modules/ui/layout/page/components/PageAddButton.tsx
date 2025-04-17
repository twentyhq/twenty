import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';

type PageAddButtonProps = {
  onClick?: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => {
  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const isMobile = useIsMobile();

  const { t } = useLingui();

  if (hasObjectReadOnlyPermission) {
    return null;
  }

  return (
    <Button
      Icon={IconPlus}
      dataTestId="add-button"
      size={isMobile ? 'medium' : 'small'}
      variant="secondary"
      accent="default"
      title={isMobile ? '' : t`New record`}
      onClick={onClick}
      ariaLabel={t`New record`}
    />
  );
};
