import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { buildViewFieldScopeInput } from '@/object-record/record-column-scope/utils/buildViewFieldScopeInput';
import { usePerformViewFieldWithScopeApiUpsert } from '@/views/hooks/internal/usePerformViewFieldWithScopeApiUpsert';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { type ViewField } from '@/views/types/ViewField';
import { duplicateViewFiltersAndViewFilterGroups } from '@/views/utils/duplicateViewFiltersAndViewFilterGroups';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCopyColumnScopes = () => {
  const store = useStore();
  const { performViewFieldWithScopeApiUpsert } =
    usePerformViewFieldWithScopeApiUpsert();

  const copyColumnScopes = useCallback(
    async ({
      viewFieldsToCopy,
      newViewId,
      newViewFieldIdByViewFieldId,
    }: {
      viewFieldsToCopy: Pick<ViewField, 'id' | 'fieldMetadataId'>[];
      newViewId: string;
      newViewFieldIdByViewFieldId: Map<string, string>;
    }) => {
      const scopeViewsByOwnerViewFieldId = store.get(
        scopeViewsByOwnerViewFieldIdMapSelector.atom,
      );
      const flattenedFieldMetadataItems = store.get(
        flattenedFieldMetadataItemsSelector.atom,
      );

      const copyResults = await Promise.all(
        viewFieldsToCopy.map((viewField) => {
          const scopeView = scopeViewsByOwnerViewFieldId.get(viewField.id);
          const newViewFieldId = newViewFieldIdByViewFieldId.get(viewField.id);

          if (!isDefined(scopeView) || !isDefined(newViewFieldId)) {
            return true;
          }

          // The copy gets its own scope view, so its children need ids of their own
          const { duplicatedViewFilterGroups, duplicatedViewFilters } =
            duplicateViewFiltersAndViewFilterGroups({
              viewFilterGroupsToDuplicate: scopeView.viewFilterGroups ?? [],
              viewFiltersToDuplicate: scopeView.viewFilters,
            });

          // The copied view field already exists, so only its scope is sent
          return performViewFieldWithScopeApiUpsert({
            id: newViewFieldId,
            viewId: newViewId,
            fieldMetadataId: viewField.fieldMetadataId,
            scope: buildViewFieldScopeInput({
              recordFilters: mapViewFiltersToFilters(
                duplicatedViewFilters,
                flattenedFieldMetadataItems,
              ),
              recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
                duplicatedViewFilterGroups,
              ),
              recordSorts: scopeView.viewSorts.map(
                ({ viewId: _viewId, ...viewSort }) => ({
                  ...viewSort,
                  id: v4(),
                }),
              ),
            }),
          });
        }),
      );

      return copyResults.every(Boolean);
    },
    [performViewFieldWithScopeApiUpsert, store],
  );

  return { copyColumnScopes };
};
