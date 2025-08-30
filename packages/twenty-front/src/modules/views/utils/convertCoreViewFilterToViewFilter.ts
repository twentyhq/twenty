import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type CoreViewFilter } from '~/generated/graphql';
import { convertViewFilterOperandFromCore } from '../utils/convertViewFilterOperandFromCore';

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
    operand: convertViewFilterOperandFromCore(coreViewFilter.operand),
    value:
      typeof coreViewFilter.value === 'string'
        ? coreViewFilter.value
        : JSON.stringify(coreViewFilter.value ?? ''),
    displayValue:
      typeof coreViewFilter.value === 'string'
        ? coreViewFilter.value
        : JSON.stringify(coreViewFilter.value ?? ''),
    viewFilterGroupId: coreViewFilter.viewFilterGroupId,
    positionInViewFilterGroup: coreViewFilter.positionInViewFilterGroup,
    subFieldName: coreViewFilter.subFieldName as CompositeFieldSubFieldName,
  };
};
