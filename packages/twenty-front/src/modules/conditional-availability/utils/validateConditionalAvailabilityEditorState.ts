import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityEditorStateValidation } from '@/conditional-availability/types/ConditionalAvailabilityEditorStateValidation';
import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { isConditionalAvailabilityFilterOrGroupValid } from '@/conditional-availability/utils/isConditionalAvailabilityFilterOrGroupValid';
import { removeConditionalAvailabilityFiltersOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityFiltersOrGroups';
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
      const filterGroup = removeConditionalAvailabilityFiltersOrGroups({
        filterGroup: editorState.filterGroup,
        shouldRemove: (filterOrGroup) =>
          filterOrGroup.type === 'filter' &&
          !isNonEmptyArray(filterOrGroup.values),
      });

      if (!isNonEmptyArray(filterGroup.children)) {
        return { status: 'valid', node: null };
      }

      if (
        !isConditionalAvailabilityFilterOrGroupValid({
          filterOrGroup: filterGroup,
        })
      ) {
        return { status: 'invalid', reason: 'invalidFilters' };
      }

      const node = convertConditionalAvailabilityFilterOrGroupToNode({
        filterOrGroup: filterGroup,
      });

      return validateConditionalAvailabilityNode({ node, metadataName }).isValid
        ? { status: 'valid', node }
        : { status: 'invalid', reason: 'invalidNode' };
    }
    default:
      return assertUnreachable(editorState);
  }
};
