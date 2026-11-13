import { type ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from 'twenty-shared/utils';

// The server lists tab filters among the view's filters, but they only apply while their tab is active
export const splitViewFiltersByViewTab = <
  TViewFilter extends Pick<ViewFilter, 'viewTabId'>,
>(
  viewFilters: TViewFilter[],
) => {
  const viewFiltersWithoutViewTab: TViewFilter[] = [];
  const viewTabFiltersByViewTabId = new Map<string, TViewFilter[]>();

  for (const viewFilter of viewFilters) {
    if (!isDefined(viewFilter.viewTabId)) {
      viewFiltersWithoutViewTab.push(viewFilter);
      continue;
    }

    viewTabFiltersByViewTabId.set(viewFilter.viewTabId, [
      ...(viewTabFiltersByViewTabId.get(viewFilter.viewTabId) ?? []),
      viewFilter,
    ]);
  }

  return { viewFiltersWithoutViewTab, viewTabFiltersByViewTabId };
};
