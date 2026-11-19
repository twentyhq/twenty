import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityEditorStateValidation } from '@/conditional-availability/types/ConditionalAvailabilityEditorStateValidation';
import { validateConditionalAvailabilityRules } from '@/conditional-availability/utils/validateConditionalAvailabilityRules';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

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
    case 'customRule': {
      const rulesValidation = validateConditionalAvailabilityRules({
        tree: editorState.tree,
        metadataName,
      });

      return rulesValidation.status === 'valid'
        ? { status: 'valid', node: rulesValidation.node }
        : { status: 'invalid' };
    }
    case 'unsupportedRule':
      return { status: 'invalid' };
    default:
      return assertUnreachable(editorState);
  }
};
