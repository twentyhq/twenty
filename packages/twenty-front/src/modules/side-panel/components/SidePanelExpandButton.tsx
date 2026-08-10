import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

const SidePanelExpandButtonContent = () => {
  const expandTarget = useSidePanelExpandTarget();

  const expandWithShortcut = useCallback(() => {
    if (expandTarget?.hasExpandShortcut) {
      expandTarget.expand();
    }
  }, [expandTarget]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: expandWithShortcut,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [expandWithShortcut],
  });

  if (!isDefined(expandTarget)) {
    return null;
  }

  return (
    <IconButton
      Icon={IconLayoutSidebarRightExpand}
      size="small"
      variant="tertiary"
      onClick={expandTarget.expand}
      ariaLabel={expandTarget.label}
    />
  );
};

export const SidePanelExpandButton = () => {
  const sidePanelPageInstance = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  );

  // Expand targets read state scoped to the side panel page, so there is
  // nothing to expand outside of one.
  if (!isDefined(sidePanelPageInstance)) {
    return null;
  }

  return <SidePanelExpandButtonContent />;
};
