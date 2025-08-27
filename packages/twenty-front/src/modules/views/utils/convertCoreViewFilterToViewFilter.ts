import { type ViewFilter } from '@/views/types/ViewFilter';
import { type CoreViewFilter } from '~/generated/graphql';
import { convertViewFilterOperandFromCore } from '../utils/convertViewFilterOperandFromCore';

export const convertCoreViewFilterToViewFilter = (
  coreViewFilter: Omit<CoreViewFilter, 'workspaceId'>,
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
    createdAt: coreViewFilter.createdAt,
    updatedAt: coreViewFilter.updatedAt,
    viewId: coreViewFilter.viewId,
    viewFilterGroupId: coreViewFilter.viewFilterGroupId ?? undefined,
    positionInViewFilterGroup: coreViewFilter.positionInViewFilterGroup ?? null,
    subFieldName: (coreViewFilter.subFieldName as any) ?? null,
  };
};
