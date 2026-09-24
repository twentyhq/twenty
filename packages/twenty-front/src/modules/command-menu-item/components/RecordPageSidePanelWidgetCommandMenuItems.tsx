import { isDefined } from 'twenty-shared/utils';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Button } from 'twenty-ui/primitives/input';

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
          size="sm"
          startIcon={
            isDefined(commandMenuItem.Icon) ? (
              <commandMenuItem.Icon />
            ) : undefined
          }
          hotkeys={commandMenuItem.hotkeys}
          onClick={commandMenuItem.onClick}
          disabled={commandMenuItem.disabled}
          variant={commandMenuItem.isPrimaryCTA ? 'solid' : 'outline'}
          color={commandMenuItem.isPrimaryCTA ? 'accent' : 'neutral'}
        >
          {commandMenuItem.label}
        </Button>
      ))}
    </>
  );
};
