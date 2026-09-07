import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Button } from 'twenty-ui/input';

export const RecordPageSidePanelWidgetCommandMenuItems = () => {
  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  const pinnedWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.filter(
      (commandMenuItem) => commandMenuItem.isPinned !== false,
    );

  return (
    <>
      {pinnedWidgetCommandMenuItems.map((commandMenuItem) => (
        <Button
          key={commandMenuItem.id}
          size="small"
          variant="primary"
          accent={commandMenuItem.isPrimaryCTA ? 'blue' : 'default'}
          title={commandMenuItem.label}
          Icon={commandMenuItem.Icon}
          hotkeys={commandMenuItem.hotkeys}
          onClick={commandMenuItem.onClick}
          disabled={commandMenuItem.disabled}
        />
      ))}
    </>
  );
};
