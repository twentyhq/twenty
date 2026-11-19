import { type ConditionalAvailabilityEditorEntry } from '@/conditional-availability/types/ConditionalAvailabilityEditorEntry';
import { isConditionalAvailabilityEditorEntryIncomplete } from '@/conditional-availability/utils/isConditionalAvailabilityEditorEntryIncomplete';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const hasIncompleteConditionalAvailabilityEditorEntry = ({
  editorEntries,
  nodesByItemKey,
}: {
  editorEntries: Record<string, ConditionalAvailabilityEditorEntry>;
  nodesByItemKey: Record<string, ConditionalAvailabilityNode | null>;
}) =>
  Object.entries(editorEntries).some(
    ([itemKey, editorEntry]) =>
      itemKey in nodesByItemKey &&
      isConditionalAvailabilityEditorEntryIncomplete({
        editorEntry,
        node: nodesByItemKey[itemKey],
      }),
  );
