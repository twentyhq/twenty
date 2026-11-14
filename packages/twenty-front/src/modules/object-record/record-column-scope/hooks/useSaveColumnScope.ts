import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { useSaveRecordFiltersToView } from '@/views/hooks/useSaveRecordFiltersToView';
import { useSaveRecordSortsToView } from '@/views/hooks/useSaveRecordSortsToView';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { type View } from '@/views/types/View';
import { duplicateViewFiltersAndViewFilterGroups } from '@/views/utils/duplicateViewFiltersAndViewFilterGroups';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ViewType, ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type WriteColumnScopeArgs = {
  ownerViewFieldId: string;
  relationObjectMetadataId: string;
  scopeView: View | undefined;
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  recordSorts: RecordSort[];
};

export const useSaveColumnScope = () => {
  const { t } = useLingui();
  const store = useStore();
  const { performViewApiCreate, performViewApiDestroy } =
    usePerformViewApiPersist();
  const { getViewFromState } = useGetViewFromState();
  const { saveRecordFiltersToView } = useSaveRecordFiltersToView();
  const { saveRecordSortsToView } = useSaveRecordSortsToView();

  const writeColumnScope = useCallback(
    async ({
      ownerViewFieldId,
      relationObjectMetadataId,
      scopeView,
      recordFilters,
      recordFilterGroups,
      recordSorts,
    }: WriteColumnScopeArgs) => {
      if (recordFilters.length === 0 && recordSorts.length === 0) {
        if (!isDefined(scopeView)) {
          return true;
        }

        const destroyResult = await performViewApiDestroy({ id: scopeView.id });

        return destroyResult.status === 'successful';
      }

      let viewToSave = scopeView;

      if (!isDefined(viewToSave)) {
        const scopeViewId = v4();

        const result = await performViewApiCreate(
          {
            input: {
              id: scopeViewId,
              name: t`Column scope`,
              icon: 'IconFilter',
              objectMetadataId: relationObjectMetadataId,
              type: ViewType.TABLE_WIDGET,
              visibility: ViewVisibility.WORKSPACE,
              ownerViewFieldId,
            },
          },
          relationObjectMetadataId,
        );

        if (result.status === 'failed') {
          return false;
        }

        viewToSave = getViewFromState(scopeViewId);
      }

      if (!isDefined(viewToSave)) {
        return false;
      }

      const [areFiltersSaved, areSortsSaved] = await Promise.all([
        saveRecordFiltersToView({
          view: viewToSave,
          recordFilters,
          recordFilterGroups,
        }),
        saveRecordSortsToView({ view: viewToSave, recordSorts }),
      ]);

      return areFiltersSaved && areSortsSaved;
    },
    [
      getViewFromState,
      performViewApiCreate,
      performViewApiDestroy,
      saveRecordFiltersToView,
      saveRecordSortsToView,
      t,
    ],
  );

  const saveColumnScope = useCallback(
    ({
      scopeInstanceId,
      ...args
    }: Pick<
      WriteColumnScopeArgs,
      'ownerViewFieldId' | 'relationObjectMetadataId' | 'scopeView'
    > & { scopeInstanceId: string }) =>
      writeColumnScope({
        ...args,
        recordFilters: store.get(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: scopeInstanceId,
          }),
        ),
        recordFilterGroups: store.get(
          currentRecordFilterGroupsComponentState.atomFamily({
            instanceId: scopeInstanceId,
          }),
        ),
        recordSorts: store.get(
          currentRecordSortsComponentState.atomFamily({
            instanceId: scopeInstanceId,
          }),
        ),
      }),
    [store, writeColumnScope],
  );

  const copyColumnScopes = useCallback(
    async (newViewFieldIdByViewFieldId: Map<string, string>) => {
      const scopeViewsByOwnerViewFieldId = store.get(
        scopeViewsByOwnerViewFieldIdMapSelector.atom,
      );
      const flattenedFieldMetadataItems = store.get(
        flattenedFieldMetadataItemsSelector.atom,
      );

      for (const [viewFieldId, newViewFieldId] of newViewFieldIdByViewFieldId) {
        const scopeView = scopeViewsByOwnerViewFieldId.get(viewFieldId);

        if (!isDefined(scopeView)) {
          continue;
        }

        const { duplicatedViewFilterGroups, duplicatedViewFilters } =
          duplicateViewFiltersAndViewFilterGroups({
            viewFilterGroupsToDuplicate: scopeView.viewFilterGroups ?? [],
            viewFiltersToDuplicate: scopeView.viewFilters,
          });

        const isCopied = await writeColumnScope({
          ownerViewFieldId: newViewFieldId,
          relationObjectMetadataId: scopeView.objectMetadataId,
          scopeView: undefined,
          recordFilters: mapViewFiltersToFilters(
            duplicatedViewFilters,
            flattenedFieldMetadataItems,
          ),
          recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
            duplicatedViewFilterGroups,
          ),
          recordSorts: scopeView.viewSorts.map(
            ({ viewId: _viewId, ...viewSort }) => ({ ...viewSort, id: v4() }),
          ),
        });

        if (!isCopied) {
          return false;
        }
      }

      return true;
    },
    [store, writeColumnScope],
  );

  return { saveColumnScope, copyColumnScopes };
};
