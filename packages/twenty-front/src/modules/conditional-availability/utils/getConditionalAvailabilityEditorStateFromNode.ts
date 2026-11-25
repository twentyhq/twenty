import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { convertConditionalAvailabilityNodeToFilterOrGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToFilterOrGroup';
import { validateConditionalAvailabilityEditorState } from '@/conditional-availability/utils/validateConditionalAvailabilityEditorState';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getConditionalAvailabilityEditorStateFromNode = ({
  node,
  metadataName,
}: {
  node: ConditionalAvailabilityNode | null;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityEditorState => {
  if (!isDefined(node)) {
    return { mode: 'everyone' };
  }

  const filterOrGroup = convertConditionalAvailabilityNodeToFilterOrGroup({
    node,
  });

  if (!isDefined(filterOrGroup)) {
    return { mode: 'unsupportedRule' };
  }

  const filterGroupAroundSingleFilter: ConditionalAvailabilityFilterGroup = {
    type: 'filterGroup',
    id: v4(),
    logicalOperator: doNotTranslate('AND'),
    children: [filterOrGroup],
  };
  const filterGroup =
    filterOrGroup.type === 'filterGroup'
      ? filterOrGroup
      : filterGroupAroundSingleFilter;

  const hasGroupInsideGroup = filterGroup.children.some(
    (child) =>
      child.type === 'filterGroup' &&
      child.children.some((groupChild) => groupChild.type === 'filterGroup'),
  );

  const editorState: ConditionalAvailabilityEditorState = {
    mode: 'customRule',
    filterGroup,
  };
  const editorStateValidation = validateConditionalAvailabilityEditorState({
    editorState,
    metadataName,
  });

  const isStoredNodeWrittenBackUnchanged =
    editorStateValidation.status === 'valid' &&
    isDeeplyEqual(editorStateValidation.node, node);

  return !hasGroupInsideGroup && isStoredNodeWrittenBackUnchanged
    ? editorState
    : { mode: 'unsupportedRule' };
};
