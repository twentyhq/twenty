import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { readConditionalAvailabilityNode } from '@/conditional-availability/utils/readConditionalAvailabilityNode';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityEditorStateFromNode = ({
  node,
  metadataName,
}: {
  node: ConditionalAvailabilityNode | null;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityEditorState => {
  const readResult = readConditionalAvailabilityNode({ node, metadataName });

  switch (readResult.status) {
    case 'empty':
      return { mode: 'everyone' };
    case 'unsupported':
      return { mode: 'unsupportedRule' };
    case 'rows':
      return { mode: 'customRule', tree: readResult.tree };
    default:
      return assertUnreachable(readResult);
  }
};
