import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import { getConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityOfferedSubjects';
import { readConditionalAvailabilityRowTree } from '@/conditional-availability/utils/readConditionalAvailabilityRowTree';
import { validateConditionalAvailabilityRules } from '@/conditional-availability/utils/validateConditionalAvailabilityRules';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getConditionalAvailabilityEditorStateFromNode = ({
  node,
  metadataName,
  fields,
}: {
  node: ConditionalAvailabilityNode | null;
  metadataName: ConditionalAvailabilityMetadataName;
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityEditorState => {
  if (!isDefined(node)) {
    return { mode: 'everyone' };
  }

  const tree = readConditionalAvailabilityRowTree({
    node,
    offeredSubjects: getConditionalAvailabilityOfferedSubjects({
      metadataName,
    }),
    fields,
  });

  if (!isDefined(tree)) {
    return { mode: 'unsupportedRule' };
  }

  const rulesValidation = validateConditionalAvailabilityRules({
    tree,
    metadataName,
  });

  return rulesValidation.status === 'valid' &&
    isDeeplyEqual(rulesValidation.node, node)
    ? { mode: 'customRule', tree }
    : { mode: 'unsupportedRule' };
};
