import { useFindManyRecordIndexTableParamsWithoutViewPresetFilter } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParamsWithoutViewPresetFilter';
import { useCurrentViewPresetFilterAsRecordGqlOperationFilter } from '@/views/hooks/useCurrentViewPresetFilterAsRecordGqlOperationFilter';
import { combineFilters } from 'twenty-shared/utils';

export const useFindManyRecordIndexTableParams = (
  objectNameSingular: string,
  instanceId?: string,
) => {
  const findManyRecordIndexTableParamsWithoutViewPresetFilter =
    useFindManyRecordIndexTableParamsWithoutViewPresetFilter({
      objectNameSingular,
      instanceId,
    });

  const currentViewPresetFilterAsRecordGqlOperationFilter =
    useCurrentViewPresetFilterAsRecordGqlOperationFilter();

  return {
    ...findManyRecordIndexTableParamsWithoutViewPresetFilter,
    filter: combineFilters([
      findManyRecordIndexTableParamsWithoutViewPresetFilter.filter,
      currentViewPresetFilterAsRecordGqlOperationFilter,
    ]),
  };
};
