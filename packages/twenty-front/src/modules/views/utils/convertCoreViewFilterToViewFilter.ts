import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { convertViewFilterValueToString } from 'twenty-shared/utils';
import { type CoreViewFilter } from '~/generated/graphql';

export const convertCoreViewFilterToViewFilter = (
  coreViewFilter: Pick<
    CoreViewFilter,
    | 'id'
    | 'fieldMetadataId'
    | 'operand'
    | 'value'
    | 'viewFilterGroupId'
    | 'positionInViewFilterGroup'
    | 'subFieldName'
  >,
): ViewFilter => {
  return {
    __typename: 'ViewFilter',
    id: coreViewFilter.id,
    fieldMetadataId: coreViewFilter.fieldMetadataId,
    operand: coreViewFilter.operand,
    value: convertViewFilterValueToString(coreViewFilter.value),
    displayValue: convertViewFilterValueToString(coreViewFilter.value),
    viewFilterGroupId: coreViewFilter.viewFilterGroupId,
    positionInViewFilterGroup: coreViewFilter.positionInViewFilterGroup,
    subFieldName: coreViewFilter.subFieldName as CompositeFieldSubFieldName,
  };
};
