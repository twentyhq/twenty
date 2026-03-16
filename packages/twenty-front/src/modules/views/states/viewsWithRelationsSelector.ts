import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { isDefined } from 'twenty-shared/utils';

export const viewsWithRelationsSelector = createAtomSelector<
  CoreViewWithRelations[]
>({
  key: 'viewsWithRelationsSelector',
  get: ({ get }) => {
    const flatViews = get(metadataStoreState, 'views').current as FlatView[];
    const allFlatViewFields = get(metadataStoreState, 'viewFields')
      .current as FlatViewField[];
    const allFlatViewFilters = get(metadataStoreState, 'viewFilters')
      .current as FlatViewFilter[];
    const allFlatViewSorts = get(metadataStoreState, 'viewSorts')
      .current as FlatViewSort[];
    const allFlatViewGroups = get(metadataStoreState, 'viewGroups')
      .current as FlatViewGroup[];
    const allFlatViewFilterGroups = get(metadataStoreState, 'viewFilterGroups')
      .current as FlatViewFilterGroup[];
    const allFlatViewFieldGroups = get(metadataStoreState, 'viewFieldGroups')
      .current as FlatViewFieldGroup[];

    const viewFieldsByViewId = new Map<string, FlatViewField[]>();
    const viewFiltersByViewId = new Map<string, FlatViewFilter[]>();
    const viewSortsByViewId = new Map<string, FlatViewSort[]>();
    const viewGroupsByViewId = new Map<string, FlatViewGroup[]>();
    const viewFilterGroupsByViewId = new Map<string, FlatViewFilterGroup[]>();
    const viewFieldGroupsByViewId = new Map<string, FlatViewFieldGroup[]>();

    for (const viewField of allFlatViewFields) {
      const existing = viewFieldsByViewId.get(viewField.viewId);

      if (isDefined(existing)) {
        existing.push(viewField);
      } else {
        viewFieldsByViewId.set(viewField.viewId, [viewField]);
      }
    }

    for (const viewFilter of allFlatViewFilters) {
      const existing = viewFiltersByViewId.get(viewFilter.viewId);

      if (isDefined(existing)) {
        existing.push(viewFilter);
      } else {
        viewFiltersByViewId.set(viewFilter.viewId, [viewFilter]);
      }
    }

    for (const viewSort of allFlatViewSorts) {
      const existing = viewSortsByViewId.get(viewSort.viewId);

      if (isDefined(existing)) {
        existing.push(viewSort);
      } else {
        viewSortsByViewId.set(viewSort.viewId, [viewSort]);
      }
    }

    for (const viewGroup of allFlatViewGroups) {
      const existing = viewGroupsByViewId.get(viewGroup.viewId);

      if (isDefined(existing)) {
        existing.push(viewGroup);
      } else {
        viewGroupsByViewId.set(viewGroup.viewId, [viewGroup]);
      }
    }

    for (const viewFilterGroup of allFlatViewFilterGroups) {
      const viewId = (viewFilterGroup as { viewId?: string }).viewId;

      if (!isDefined(viewId)) {
        continue;
      }

      const existing = viewFilterGroupsByViewId.get(viewId);

      if (isDefined(existing)) {
        existing.push(viewFilterGroup);
      } else {
        viewFilterGroupsByViewId.set(viewId, [viewFilterGroup]);
      }
    }

    for (const viewFieldGroup of allFlatViewFieldGroups) {
      const viewId = (viewFieldGroup as { viewId?: string }).viewId;

      if (!isDefined(viewId)) {
        continue;
      }

      const existing = viewFieldGroupsByViewId.get(viewId);

      if (isDefined(existing)) {
        existing.push(viewFieldGroup);
      } else {
        viewFieldGroupsByViewId.set(viewId, [viewFieldGroup]);
      }
    }

    return flatViews.map((flatView) => ({
      ...flatView,
      viewFields: viewFieldsByViewId.get(flatView.id) ?? [],
      viewFilters: viewFiltersByViewId.get(flatView.id) ?? [],
      viewSorts: viewSortsByViewId.get(flatView.id) ?? [],
      viewGroups: viewGroupsByViewId.get(flatView.id) ?? [],
      viewFilterGroups: viewFilterGroupsByViewId.get(flatView.id) ?? [],
      viewFieldGroups: (viewFieldGroupsByViewId.get(flatView.id) ?? []).map(
        (group) => ({
          ...group,
          viewFields: (viewFieldsByViewId.get(flatView.id) ?? []).filter(
            (field) =>
              (field as unknown as { viewFieldGroupId?: string })
                .viewFieldGroupId === group.id,
          ),
        }),
      ),
    }));
  },
});
