import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { type ConditionalAvailabilityFilterGroupValidation } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroupValidation';
import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { isConditionalAvailabilityFilterOrGroupValid } from '@/conditional-availability/utils/isConditionalAvailabilityFilterOrGroupValid';
import { removeConditionalAvailabilityFiltersOrGroups } from '@/conditional-availability/utils/removeConditionalAvailabilityFiltersOrGroups';
import {
  type ConditionalAvailabilityMetadataName,
  validateConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const validateConditionalAvailabilityFilterGroup = ({
  filterGroup,
  metadataName,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityFilterGroupValidation => {
  const filterGroupWithoutEmptyFilters =
    removeConditionalAvailabilityFiltersOrGroups({
      filterGroup,
      shouldRemove: (filterOrGroup) =>
        filterOrGroup.type === 'filter' &&
        !isNonEmptyArray(filterOrGroup.values),
    });

  if (!isNonEmptyArray(filterGroupWithoutEmptyFilters.children)) {
    return { isValid: true, node: null };
  }

  if (
    !isConditionalAvailabilityFilterOrGroupValid({
      filterOrGroup: filterGroupWithoutEmptyFilters,
    })
  ) {
    return { isValid: false, reason: 'invalidFilters' };
  }

  const node = convertConditionalAvailabilityFilterOrGroupToNode({
    filterOrGroup: filterGroupWithoutEmptyFilters,
  });

  return validateConditionalAvailabilityNode({ node, metadataName }).isValid
    ? { isValid: true, node }
    : { isValid: false, reason: 'invalidNode' };
};
