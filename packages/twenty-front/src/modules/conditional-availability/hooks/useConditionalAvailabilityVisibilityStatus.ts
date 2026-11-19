import { conditionalAvailabilityEditorEntriesState } from '@/conditional-availability/states/conditionalAvailabilityEditorEntriesState';
import { type ConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/types/ConditionalAvailabilityVisibilityStatus';
import { isConditionalAvailabilityEditorEntryIncomplete } from '@/conditional-availability/utils/isConditionalAvailabilityEditorEntryIncomplete';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useConditionalAvailabilityVisibilityStatus = ({
  itemKey,
  node,
}: {
  itemKey: string;
  node: ConditionalAvailabilityNode | null;
}): ConditionalAvailabilityVisibilityStatus => {
  const conditionalAvailabilityEditorEntries = useAtomStateValue(
    conditionalAvailabilityEditorEntriesState,
  );

  if (
    isConditionalAvailabilityEditorEntryIncomplete({
      editorEntry: conditionalAvailabilityEditorEntries[itemKey],
      node,
    })
  ) {
    return 'incompleteRule';
  }

  return isDefined(node) ? 'customRule' : 'everyone';
};
