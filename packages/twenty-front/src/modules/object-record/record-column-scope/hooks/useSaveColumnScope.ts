import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { useSaveRecordFiltersToView } from '@/views/hooks/useSaveRecordFiltersToView';
import { useSaveRecordSortsToView } from '@/views/hooks/useSaveRecordSortsToView';
import { type View } from '@/views/types/View';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ViewType, ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useSaveColumnScope = () => {
  const { t } = useLingui();
  const store = useStore();
  const { performViewApiCreate, performViewApiDestroy } =
    usePerformViewApiPersist();
  const { getViewFromState } = useGetViewFromState();
  const { saveRecordFiltersToView } = useSaveRecordFiltersToView();
  const { saveRecordSortsToView } = useSaveRecordSortsToView();

  const createScopeView = useCallback(
    async ({
      ownerViewFieldId,
      relationObjectMetadataId,
    }: {
      ownerViewFieldId: string;
      relationObjectMetadataId: string;
    }): Promise<View | undefined> => {
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
        return undefined;
      }

      return getViewFromState(scopeViewId);
    },
    [getViewFromState, performViewApiCreate, t],
  );

  const saveColumnScope = useCallback(
    async ({
      scopeInstanceId,
      ownerViewFieldId,
      relationObjectMetadataId,
      scopeView,
    }: {
      scopeInstanceId: string;
      ownerViewFieldId: string;
      relationObjectMetadataId: string;
      scopeView: View | undefined;
    }) => {
      const recordFilters = store.get(
        currentRecordFiltersComponentState.atomFamily({
          instanceId: scopeInstanceId,
        }),
      );
      const recordFilterGroups = store.get(
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId: scopeInstanceId,
        }),
      );
      const recordSorts = store.get(
        currentRecordSortsComponentState.atomFamily({
          instanceId: scopeInstanceId,
        }),
      );

      if (recordFilters.length === 0 && recordSorts.length === 0) {
        if (!isDefined(scopeView)) {
          return true;
        }

        const destroyResult = await performViewApiDestroy({ id: scopeView.id });

        return destroyResult.status === 'successful';
      }

      const viewToSave =
        scopeView ??
        (await createScopeView({
          ownerViewFieldId,
          relationObjectMetadataId,
        }));

      if (!isDefined(viewToSave)) {
        return false;
      }

      const areFiltersSaved = await saveRecordFiltersToView({
        view: viewToSave,
        recordFilters,
        recordFilterGroups,
      });

      if (!areFiltersSaved) {
        return false;
      }

      return saveRecordSortsToView({ view: viewToSave, recordSorts });
    },
    [
      createScopeView,
      performViewApiDestroy,
      saveRecordFiltersToView,
      saveRecordSortsToView,
      store,
    ],
  );

  return { saveColumnScope };
};
