import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { convertConditionalAvailabilityNodeToFilterOrGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToFilterOrGroup';
import { validateConditionalAvailabilityFilterGroup } from '@/conditional-availability/utils/validateConditionalAvailabilityFilterGroup';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const convertConditionalAvailabilityNodeToFilterGroup = ({
  node,
  metadataName,
}: {
  node: ConditionalAvailabilityNode;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityFilterGroup | null => {
  const filterOrGroup = convertConditionalAvailabilityNodeToFilterOrGroup({
    node,
  });

  if (!isDefined(filterOrGroup)) {
    return null;
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

  const filterGroupValidation = validateConditionalAvailabilityFilterGroup({
    filterGroup,
    metadataName,
  });

  const isStoredNodeWrittenBackUnchanged =
    filterGroupValidation.isValid &&
    isDeeplyEqual(filterGroupValidation.node, node);

  return !hasGroupInsideGroup && isStoredNodeWrittenBackUnchanged
    ? filterGroup
    : null;
};
