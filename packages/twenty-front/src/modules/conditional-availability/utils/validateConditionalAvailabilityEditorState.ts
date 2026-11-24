import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityEditorStateValidation } from '@/conditional-availability/types/ConditionalAvailabilityEditorStateValidation';
import { convertConditionalAvailabilityRowOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityRowOrGroupToNode';
import { isConditionalAvailabilityRowOrGroupValid } from '@/conditional-availability/utils/isConditionalAvailabilityRowOrGroupValid';
import { removeConditionalAvailabilityRowsOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityRowsOrGroups';
import {
  type ConditionalAvailabilityMetadataName,
  validateConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

export const validateConditionalAvailabilityEditorState = ({
  editorState,
  metadataName,
}: {
  editorState: ConditionalAvailabilityEditorState;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityEditorStateValidation => {
  switch (editorState.mode) {
    case 'everyone':
      return { status: 'valid', node: null };
    case 'unsupportedRule':
      return { status: 'invalid', reason: 'unsupportedRule' };
    case 'customRule': {
      const rowTree = removeConditionalAvailabilityRowsOrGroups({
        rowGroup: editorState.rowTree,
        shouldRemove: (rowOrGroup) =>
          rowOrGroup.type === 'row' && !isNonEmptyArray(rowOrGroup.values),
      });

      if (!isNonEmptyArray(rowTree.children)) {
        return { status: 'valid', node: null };
      }

      if (!isConditionalAvailabilityRowOrGroupValid({ rowOrGroup: rowTree })) {
        return { status: 'invalid', reason: 'invalidRows' };
      }

      const node = convertConditionalAvailabilityRowOrGroupToNode({
        rowOrGroup: rowTree,
      });

      return validateConditionalAvailabilityNode({ node, metadataName }).isValid
        ? { status: 'valid', node }
        : { status: 'invalid', reason: 'invalidNode' };
    }
    default:
      return assertUnreachable(editorState);
  }
};
