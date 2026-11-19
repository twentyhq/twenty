import { type ConditionalAvailabilityEditorEntry } from '@/conditional-availability/types/ConditionalAvailabilityEditorEntry';
import { validateConditionalAvailabilityEditorState } from '@/conditional-availability/utils/validateConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const isConditionalAvailabilityEditorEntryIncomplete = ({
  editorEntry,
  node,
}: {
  editorEntry: ConditionalAvailabilityEditorEntry | undefined;
  node: ConditionalAvailabilityNode | null;
}) =>
  isDefined(editorEntry) &&
  isDeeplyEqual(editorEntry.storedNode, node) &&
  validateConditionalAvailabilityEditorState({
    editorState: editorEntry.editorState,
    metadataName: editorEntry.metadataName,
  }).status === 'invalid';
