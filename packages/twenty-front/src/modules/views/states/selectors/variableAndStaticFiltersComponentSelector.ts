import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';
import { StaticFilter } from '@/views/filter-transforms/types/StaticFilter';
import { VariableFilter } from '@/views/filter-transforms/types/VariableFilter';
import { variableViewFilterToVariableFilter } from '@/views/filter-transforms/utils/variableViewFilterToVariableFilter';
import { viewFilterToStaticFilter } from '@/views/filter-transforms/utils/viewFilterToStaticFilter';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterType } from '@/views/types/ViewFilterType';

export const variableAndStaticFiltersComponentSelector =
  createComponentFamilySelectorV2<
    {
      variableFilters: VariableFilter[];
      staticFilters: StaticFilter[];
    },
    { viewId?: string }
  >({
    key: 'variableAndStaticFiltersComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({
        get,
      }): {
        variableFilters: VariableFilter[];
        staticFilters: StaticFilter[];
      } => {
        /*      const unsavedToUpsertViewFilters = useRecoilComponentFamilyValueV2(
          unsavedToUpsertViewFiltersComponentFamilyState,
          { viewId },
          instanceId,
        );

        const unsavedToDeleteViewFilterIds = useRecoilComponentFamilyValueV2(
          unsavedToDeleteViewFilterIdsComponentFamilyState,
          { viewId },
          instanceId,
        ); */

        /* const { currentViewWithCombinedFiltersAndSorts } = getCombinedViewFilters(
          currentView.viewFilters,
          unsavedToUpsertViewFilters,
          unsavedToDeleteViewFilterIds,
        ); */

        const currentViewWithCombinedFiltersAndSorts = {
          viewFilters: [] as ViewFilter[],
        };

        if (!currentViewWithCombinedFiltersAndSorts) {
          return {
            variableFilters: [],
            staticFilters: [],
          };
        }

        const { viewFilters } = currentViewWithCombinedFiltersAndSorts;

        const variableFilters = viewFilters
          .filter((viewFilter) => viewFilter.type === ViewFilterType.VARIABLE)
          .map(variableViewFilterToVariableFilter);

        const staticFilters = viewFilters.map(viewFilterToStaticFilter);

        return {
          variableFilters,
          staticFilters,
        };
      },
  });
