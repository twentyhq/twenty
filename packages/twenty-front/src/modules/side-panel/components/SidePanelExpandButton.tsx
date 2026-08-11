import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// Registered only for targets that claim the shortcut, so pages whose content
// owns cmd+enter keep it to themselves.
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

  return (
    <>
      {expandTarget.hasExpandShortcut && (
        <SidePanelExpandShortcutEffect expand={expandTarget.expand} />
      )}
      <IconButton
        Icon={IconLayoutSidebarRightExpand}
        size="small"
        variant="tertiary"
        onClick={expandTarget.expand}
        ariaLabel={expandTarget.label}
      />
    </>
  );
};

export const SidePanelExpandButton = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  // Expand targets read state scoped to the side panel page. The context
  // defaults to a blank instance id, which those reads reject, so match the
  // condition they enforce rather than merely checking the context exists.
  if (!isNonEmptyString(sidePanelPageInstanceId)) {
    return null;
  }

  return <SidePanelExpandButtonContent />;
};
