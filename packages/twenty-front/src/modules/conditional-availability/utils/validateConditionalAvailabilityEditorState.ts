import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityEditorStateValidation } from '@/conditional-availability/types/ConditionalAvailabilityEditorStateValidation';
import { convertConditionalAvailabilityRowOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityRowOrGroupToNode';
import { isConditionalAvailabilityRowOrGroupValid } from '@/conditional-availability/utils/isConditionalAvailabilityRowOrGroupValid';
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
