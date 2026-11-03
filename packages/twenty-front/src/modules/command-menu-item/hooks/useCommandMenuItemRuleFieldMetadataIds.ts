import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalDisplayRecordFilter } from 'twenty-shared/types';

export const useCommandMenuItemRuleFieldMetadataIds = (
  objectMetadataItemId: string,
): string[] => {
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  return commandMenuItems
    .filter(
      (commandMenuItem) =>
        commandMenuItem.availabilityObjectMetadataId === objectMetadataItemId,
    )
    .flatMap((commandMenuItem) =>
      (commandMenuItem.conditionalDisplay?.recordFilters ?? [])
        .map(
          (recordFilter: ConditionalDisplayRecordFilter) =>
            recordFilter.fieldMetadataId,
        )
        .filter(isNonEmptyString),
    );
};
