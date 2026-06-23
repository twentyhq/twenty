import { useEffect } from 'react';

import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type EmailThreadComposerFooterEffectProps = {
  footerCommandMenuItems: SidePanelFooterCommandMenuItem[];
};

export const EmailThreadComposerFooterEffect = ({
  footerCommandMenuItems,
}: EmailThreadComposerFooterEffectProps) => {
  const setSidePanelWidgetFooterCommandMenuItems = useSetAtomState(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  useEffect(() => {
    setSidePanelWidgetFooterCommandMenuItems(footerCommandMenuItems);

    return () => setSidePanelWidgetFooterCommandMenuItems([]);
  }, [footerCommandMenuItems, setSidePanelWidgetFooterCommandMenuItems]);

  return <></>;
};
