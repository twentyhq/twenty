import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { IconButtonWithTooltip } from 'twenty-ui/input';

export const SidePanelCloseButton = () => {
  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const closeSidePanelLabel = t`Close side panel`;

  return (
    <IconButtonWithTooltip
      tooltipContent={closeSidePanelLabel}
      Icon={IconX}
      size="small"
      variant="primary"
      onClick={closeSidePanelMenu}
      ariaLabel={closeSidePanelLabel}
    />
  );
};
