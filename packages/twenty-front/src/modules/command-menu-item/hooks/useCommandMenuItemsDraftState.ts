import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsWithInactiveSelector } from '@/command-menu-item/states/commandMenuItemsWithInactiveSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const pickEditableFields = ({
  id,
  isPinned,
  isActive,
  position,
  shortLabel,
}: CommandMenuItemFieldsFragment) => ({
  id,
  isPinned,
  isActive,
  position,
  shortLabel,
});

export const useCommandMenuItemsDraftState = () => {
  const commandMenuItemsWithInactive = useAtomStateValue(
    commandMenuItemsWithInactiveSelector,
  );
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);

  const isDirty =
    isDefined(commandMenuItemsDraft) &&
    !isDeeplyEqual(
      commandMenuItemsDraft.map(pickEditableFields),
      commandMenuItemsWithInactive.map(pickEditableFields),
    );

  return {
    commandMenuItemsDraft,
    isDirty,
  };
};
