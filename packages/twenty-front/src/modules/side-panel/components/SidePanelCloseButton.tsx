import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { IconX } from 'twenty-ui/icon';
import { IconButtonWithTooltip } from 'twenty-ui/input';

const SIDE_PANEL_CLOSE_BUTTON_ID = 'side-panel-close-button';

type SidePanelCloseButtonProps = {
  isHidden: boolean;
};

export const SidePanelCloseButton = ({
  isHidden,
}: SidePanelCloseButtonProps) => {
  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const handleSidePanelEscape = useHandleSidePanelEscape();

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: handleSidePanelEscape,
    containsModifier: false,
    dependencies: [handleSidePanelEscape],
  });

  if (isHidden) {
    return null;
  }

  const tooltipContent = t`Close side panel | esc`;

  return (
    <IconButtonWithTooltip
      tooltipId={SIDE_PANEL_CLOSE_BUTTON_ID}
      tooltipContent={tooltipContent}
      Icon={IconX}
      size="small"
      variant="primary"
      onClick={closeSidePanelMenu}
      ariaLabel={t`Close side panel`}
    />
  );
};
