import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useLingui } from '@lingui/react/macro';
import { Button, IconPlus, useIsMobile } from 'twenty-ui';

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
