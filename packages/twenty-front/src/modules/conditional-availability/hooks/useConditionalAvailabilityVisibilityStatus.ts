import { conditionalAvailabilityEditorStatesState } from '@/conditional-availability/states/conditionalAvailabilityEditorStatesState';
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
  const conditionalAvailabilityEditorStates = useAtomStateValue(
    conditionalAvailabilityEditorStatesState,
  );

  if (
    isConditionalAvailabilityEditorEntryIncomplete({
      editorEntry: conditionalAvailabilityEditorStates[itemKey],
      node,
    })
  ) {
    return 'incompleteRule';
  }

  return isDefined(node) ? 'customRule' : 'everyone';
};
