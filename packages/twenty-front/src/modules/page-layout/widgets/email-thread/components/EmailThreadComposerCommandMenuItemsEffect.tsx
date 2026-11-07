import { useEffect } from 'react';

import { recordShowPageWidgetHeaderCommandMenuItemsState } from '@/command-menu-item/states/recordShowPageWidgetHeaderCommandMenuItemsState';
import { type WidgetCommandMenuItem } from '@/command-menu-item/types/WidgetCommandMenuItem';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type EmailThreadComposerCommandMenuItemsEffectProps = {
  commandMenuItems: WidgetCommandMenuItem[];
  isInSidePanel: boolean;
};

export const EmailThreadComposerCommandMenuItemsEffect = ({
  commandMenuItems,
  isInSidePanel,
}: EmailThreadComposerCommandMenuItemsEffectProps) => {
  const setWidgetCommandMenuItems = useSetAtomState(
    isInSidePanel
      ? sidePanelWidgetFooterCommandMenuItemsState
      : recordShowPageWidgetHeaderCommandMenuItemsState,
  );

  useEffect(() => {
    setWidgetCommandMenuItems(commandMenuItems);

    return () => setWidgetCommandMenuItems([]);
  }, [commandMenuItems, setWidgetCommandMenuItems]);

  return <></>;
};
