import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordPageSidePanelPinnedCommandMenuItems = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  if (!isDefined(contextStoreCurrentObjectMetadataItemId)) {
    return null;
  }

  return (
    <CommandMenuContextProvider
      isInSidePanel={true}
      displayType="button"
      containerType={CommandMenuItemContainerType.SidePanelFooter}
    >
      <PinnedCommandMenuItemButtons />
    </CommandMenuContextProvider>
  );
};
