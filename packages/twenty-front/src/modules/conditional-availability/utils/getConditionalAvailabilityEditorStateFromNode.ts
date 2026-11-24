import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { convertConditionalAvailabilityNodeToRowOrGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToRowOrGroup';
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

  const rowOrGroup = convertConditionalAvailabilityNodeToRowOrGroup({ node });

  if (!isDefined(rowOrGroup)) {
    return { mode: 'unsupportedRule' };
  }

  const rowGroupAroundSingleRow: ConditionalAvailabilityRowGroup = {
    type: 'group',
    id: v4(),
    logicalOperator: doNotTranslate('AND'),
    children: [rowOrGroup],
  };
  const rowTree =
    rowOrGroup.type === 'group' ? rowOrGroup : rowGroupAroundSingleRow;

  const hasGroupInsideGroup = rowTree.children.some(
    (child) =>
      child.type === 'group' &&
      child.children.some((groupChild) => groupChild.type === 'group'),
  );

  const editorState: ConditionalAvailabilityEditorState = {
    mode: 'customRule',
    rowTree,
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
