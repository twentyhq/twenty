import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconMaximize } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components/input';
import { formatShortcut } from 'twenty-ui/primitives/typography';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// Registered only for targets that claim it, so pages whose content owns cmd+enter keep it
const SidePanelExpandShortcutEffect = ({ expand }: { expand: () => void }) => {
  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: expand,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [expand],
  });

  return null;
};

const SidePanelExpandButtonContent = () => {
  const expandTarget = useSidePanelExpandTarget();

  if (!isDefined(expandTarget)) {
    return null;
  }

  const isDisabled = isDefined(expandTarget.disabledReason);
  const tooltipContent =
    expandTarget.disabledReason ??
    (expandTarget.hasExpandShortcut
      ? `${expandTarget.label} | ${formatShortcut({ shortcut: ['Mod', 'Enter'] })}`
      : expandTarget.label);

  return (
    <>
      {expandTarget.hasExpandShortcut && !isDisabled && (
        <SidePanelExpandShortcutEffect expand={expandTarget.expand} />
      )}
      <IconButton
        tooltip={tooltipContent}
        disabled={isDisabled}
        size="sm"
        variant="ghost"
        onClick={expandTarget.expand}
        aria-label={expandTarget.label}
      >
        <IconMaximize />
      </IconButton>
    </>
  );
};

export const SidePanelExpandButton = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  // The context defaults to a blank instance id that expand targets reject, so check for that rather than presence
  if (!isNonEmptyString(sidePanelPageInstanceId)) {
    return null;
  }

  return <SidePanelExpandButtonContent />;
};
