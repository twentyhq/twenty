import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';

export const SidePanelCloseButton = () => {
  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const closeSidePanelLabel = t`Close side panel`;

  return (
    <IconButton
      tooltip={closeSidePanelLabel}
      size="sm"
      variant="outline"
      onClick={closeSidePanelMenu}
      aria-label={closeSidePanelLabel}
    >
      <IconX />
    </IconButton>
  );
};
