import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/edit/hooks/useUpdateCommandMenuItemInDraft';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemVisibilityEditItemIdState } from '@/command-menu-item/edit/states/commandMenuItemVisibilityEditItemIdState';
import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelCommandMenuItemVisibilitySubPage = () => {
  const commandMenuItemVisibilityEditItemId = useAtomStateValue(
    commandMenuItemVisibilityEditItemIdState,
  );

  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);

  const { updateCommandMenuItemInDraft } = useUpdateCommandMenuItemInDraft();

  const commandMenuItem = commandMenuItemsDraft?.find(
    (item) => item.id === commandMenuItemVisibilityEditItemId,
  );

  if (!isDefined(commandMenuItem)) {
    return null;
  }

  return (
    <ConditionalDisplaySettings
      surface="commandMenuItem"
      surfaceId={commandMenuItem.id}
      conditionalDisplay={commandMenuItem.conditionalDisplay}
      objectMetadataId={commandMenuItem.availabilityObjectMetadataId}
      onConditionalDisplayChange={(conditionalDisplay) =>
        updateCommandMenuItemInDraft(commandMenuItem.id, {
          conditionalDisplay,
        })
      }
    />
  );
};
