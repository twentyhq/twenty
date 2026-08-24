import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getWidgetHeaderCommandMenuItems } from '@/page-layout/widgets/widget-card/utils/getWidgetHeaderCommandMenuItems';
import { useContext } from 'react';

const WidgetHeaderCommandMenuItemButtons = ({
  applicationId,
  commandMenuItemUniversalIdentifiers,
}: {
  applicationId: string;
  commandMenuItemUniversalIdentifiers: string[];
}) => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const widgetHeaderCommandMenuItems = getWidgetHeaderCommandMenuItems({
    commandMenuItems,
    commandMenuItemUniversalIdentifiers,
    applicationId,
  });

  return widgetHeaderCommandMenuItems.map((commandMenuItem) => (
    <CommandMenuItemRenderer
      key={commandMenuItem.id}
      item={commandMenuItem}
      shouldHideLabel
    />
  ));
};

export const WidgetHeaderCommandMenuItems = ({
  applicationId,
  commandMenuItemUniversalIdentifiers,
}: {
  applicationId: string;
  commandMenuItemUniversalIdentifiers: string[];
}) => (
  <CommandMenuContextProvider
    isInSidePanel={false}
    displayType="button"
    containerType={CommandMenuItemContainerType.WidgetHeader}
  >
    <WidgetHeaderCommandMenuItemButtons
      applicationId={applicationId}
      commandMenuItemUniversalIdentifiers={commandMenuItemUniversalIdentifiers}
    />
  </CommandMenuContextProvider>
);
