import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRulesValidation } from '@/conditional-availability/types/ConditionalAvailabilityRulesValidation';
import { buildConditionalAvailabilityNode } from '@/conditional-availability/utils/buildConditionalAvailabilityNode';
import { isConditionalAvailabilityRowComplete } from '@/conditional-availability/utils/isConditionalAvailabilityRowComplete';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import {
  checkConditionalAvailabilityNode,
  isNonEmptyArray,
} from 'twenty-shared/utils';

export const validateConditionalAvailabilityRules = ({
  tree,
  metadataName,
}: {
  tree: ConditionalAvailabilityRowTree;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityRulesValidation => {
  const rows = tree.children.flatMap((child) =>
    child.type === 'row' ? [child.row] : child.group.rows,
  );

  if (!isNonEmptyArray(rows)) {
    return { status: 'invalid', reason: 'noRow' };
  }

  if (!rows.every((row) => isConditionalAvailabilityRowComplete({ row }))) {
    return { status: 'invalid', reason: 'incompleteRows' };
  }

  const node = buildConditionalAvailabilityNode({ tree });
  const checkResult = checkConditionalAvailabilityNode({ node, metadataName });

  return checkResult.isValid
    ? { status: 'valid', node }
    : { status: 'invalid', reason: 'ruleError', ruleError: checkResult };
};
