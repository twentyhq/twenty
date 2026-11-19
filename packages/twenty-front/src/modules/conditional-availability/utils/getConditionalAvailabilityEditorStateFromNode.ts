import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { readConditionalAvailabilityNode } from '@/conditional-availability/utils/readConditionalAvailabilityNode';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityEditorStateFromNode = ({
  node,
  metadataName,
  fields,
}: {
  node: ConditionalAvailabilityNode | null;
  metadataName: ConditionalAvailabilityMetadataName;
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityEditorState => {
  const readResult = readConditionalAvailabilityNode({
    node,
    metadataName,
    fields,
  });

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
