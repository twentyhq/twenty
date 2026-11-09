import { WidgetCommandMenuItemButtons } from '@/command-menu-item/components/WidgetCommandMenuItemButtons';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const RecordPageSidePanelWidgetCommandMenuItems = () => {
  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  return (
    <WidgetCommandMenuItemButtons
      commandMenuItems={sidePanelWidgetFooterCommandMenuItems}
    />
  );
};
