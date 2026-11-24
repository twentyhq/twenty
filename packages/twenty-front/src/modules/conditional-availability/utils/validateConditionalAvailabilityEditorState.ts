import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityEditorStateValidation } from '@/conditional-availability/types/ConditionalAvailabilityEditorStateValidation';
import { convertConditionalAvailabilityRowTreeChildToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityRowTreeChildToNode';
import { isConditionalAvailabilityRowTreeChildComplete } from '@/conditional-availability/utils/isConditionalAvailabilityRowTreeChildComplete';
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
      const { rowTree } = editorState;

      if (!isNonEmptyArray(rowTree.children)) {
        return { status: 'invalid', reason: 'noRow' };
      }

      if (!isConditionalAvailabilityRowTreeChildComplete({ child: rowTree })) {
        return { status: 'invalid', reason: 'incompleteRows' };
      }

      const node = convertConditionalAvailabilityRowTreeChildToNode({
        child: rowTree,
      });

      return validateConditionalAvailabilityNode({ node, metadataName }).isValid
        ? { status: 'valid', node }
        : { status: 'invalid', reason: 'invalidNode' };
    }
    default:
      return assertUnreachable(editorState);
  }
};
