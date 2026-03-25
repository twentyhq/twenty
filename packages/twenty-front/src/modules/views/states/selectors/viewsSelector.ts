import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';

export const viewsSelector = createAtomSelector<ViewWithRelations[]>({
  key: 'viewsSelector',
  get: ({ get }) => {
    const flatViews = get(metadataStoreState, 'views').current as FlatView[];
    const flatObjectMetadataItems = get(
      metadataStoreState,
      'objectMetadataItems',
    ).current as FlatObjectMetadataItem[];

    const objectMetadataItemsById = new Map(
      flatObjectMetadataItems.map((item) => [item.id, item]),
    );

    const flatViewFields = get(metadataStoreState, 'viewFields')
      .current as FlatViewField[];
    const flatViewFilters = get(metadataStoreState, 'viewFilters')
      .current as FlatViewFilter[];
    const flatViewSorts = get(metadataStoreState, 'viewSorts')
      .current as FlatViewSort[];
    const flatViewGroups = get(metadataStoreState, 'viewGroups')
      .current as FlatViewGroup[];
    const flatViewFilterGroups = get(metadataStoreState, 'viewFilterGroups')
      .current as FlatViewFilterGroup[];
    const flatViewFieldGroups = get(metadataStoreState, 'viewFieldGroups')
      .current as FlatViewFieldGroup[];

    const viewFieldsByViewId = new Map<string, FlatViewField[]>();
    const viewFiltersByViewId = new Map<string, FlatViewFilter[]>();
    const viewSortsByViewId = new Map<string, FlatViewSort[]>();
    const viewGroupsByViewId = new Map<string, FlatViewGroup[]>();
    const viewFilterGroupsByViewId = new Map<string, FlatViewFilterGroup[]>();
    const viewFieldGroupsByViewId = new Map<string, FlatViewFieldGroup[]>();

    for (const field of flatViewFields) {
      const existing = viewFieldsByViewId.get(field.viewId) ?? [];
      existing.push(field);
      viewFieldsByViewId.set(field.viewId, existing);
    }

    for (const filter of flatViewFilters) {
      const existing = viewFiltersByViewId.get(filter.viewId) ?? [];
      existing.push(filter);
      viewFiltersByViewId.set(filter.viewId, existing);
    }

    for (const sort of flatViewSorts) {
      const existing = viewSortsByViewId.get(sort.viewId) ?? [];
      existing.push(sort);
      viewSortsByViewId.set(sort.viewId, existing);
    }

    for (const group of flatViewGroups) {
      const existing = viewGroupsByViewId.get(group.viewId) ?? [];
      existing.push(group);
      viewGroupsByViewId.set(group.viewId, existing);
    }

    for (const filterGroup of flatViewFilterGroups) {
      if ('viewId' in filterGroup && typeof filterGroup.viewId === 'string') {
        const existing = viewFilterGroupsByViewId.get(filterGroup.viewId) ?? [];
        existing.push(filterGroup);
        viewFilterGroupsByViewId.set(filterGroup.viewId, existing);
      }
    }

    for (const fieldGroup of flatViewFieldGroups) {
      if ('viewId' in fieldGroup && typeof fieldGroup.viewId === 'string') {
        const existing = viewFieldGroupsByViewId.get(fieldGroup.viewId) ?? [];
        existing.push(fieldGroup);
        viewFieldGroupsByViewId.set(fieldGroup.viewId, existing);
      }
    }

    return flatViews.map((view) => ({
      ...view,
      name: resolveViewNamePlaceholders(
        view.name,
        objectMetadataItemsById.get(view.objectMetadataId),
      ),
      viewFields: viewFieldsByViewId.get(view.id) ?? [],
      viewFilters: viewFiltersByViewId.get(view.id) ?? [],
      viewSorts: viewSortsByViewId.get(view.id) ?? [],
      viewGroups: viewGroupsByViewId.get(view.id) ?? [],
      viewFilterGroups: viewFilterGroupsByViewId.get(view.id) ?? [],
      viewFieldGroups: (viewFieldGroupsByViewId.get(view.id) ?? []).map(
        (fieldGroup) => ({
          ...fieldGroup,
          viewFields: (viewFieldsByViewId.get(view.id) ?? []).filter(
            (field) =>
              'viewFieldGroupId' in field &&
              field.viewFieldGroupId === fieldGroup.id,
          ),
        }),
      ),
    })) as ViewWithRelations[];
  },
});
