import { useEffect } from 'react';

import { recordShowPageWidgetHeaderCommandMenuItemsState } from '@/command-menu-item/states/recordShowPageWidgetHeaderCommandMenuItemsState';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type EmailThreadComposerFooterEffectProps = {
  footerCommandMenuItems: SidePanelFooterCommandMenuItem[];
  isInSidePanel: boolean;
};

export const EmailThreadComposerFooterEffect = ({
  footerCommandMenuItems,
  isInSidePanel,
}: EmailThreadComposerFooterEffectProps) => {
  const setWidgetCommandMenuItems = useSetAtomState(
    isInSidePanel
      ? sidePanelWidgetFooterCommandMenuItemsState
      : recordShowPageWidgetHeaderCommandMenuItemsState,
  );

  useEffect(() => {
    setWidgetCommandMenuItems(footerCommandMenuItems);

    return () => setWidgetCommandMenuItems([]);
  }, [footerCommandMenuItems, setWidgetCommandMenuItems]);

  return <></>;
};
