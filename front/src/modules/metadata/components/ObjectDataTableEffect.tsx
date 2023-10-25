import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useSort } from '@/ui/data/sort/hooks/useSort';
import { sortsScopedState } from '@/ui/data/sort/states/sortsScopedState';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/data/view-bar/states/savedFiltersFamilyState';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { useView } from '@/views/hooks/useView';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { savedSortsScopedFamilyState } from '@/views/states/savedViewSortsScopedFamilyState';

import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useSetObjectDataTableData } from '../hooks/useSetDataTableData';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

export type ObjectDataTableEffectProps = MetadataObjectIdentifier;

export const ObjectDataTableEffect = ({
  objectNamePlural,
}: ObjectDataTableEffectProps) => {
  const setDataTableData = useSetObjectDataTableData();

  const { objects, loading } = useFindManyObjects({
    objectNamePlural,
  });

  useEffect(() => {
    if (!loading) {
      const entities = objects ?? [];

      setDataTableData(entities);
    }
  }, [objects, setDataTableData, loading]);

  const { scopeId: viewScopeId } = useView();

  const { scopeId: sortScopeId } = useSort();

  const [searchParams] = useSearchParams();
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentView = await snapshot.getPromise(
          currentViewIdScopedState({ scopeId: tableRecoilScopeId }),
        );
        if (currentView === viewId) {
          return;
        }

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        );

        set(filtersScopedState(tableRecoilScopeId), savedFilters);
        set(sortsScopedState({ scopeId: sortScopeId }), savedSorts);
        set(currentViewIdScopedState({ scopeId: tableRecoilScopeId }), viewId);
      },
    [tableRecoilScopeId, viewScopeId, sortScopeId],
  );

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewSelect(viewId);
    } else {
      handleViewSelect(objectNamePlural);
    }
  }, [handleViewSelect, searchParams, objectNamePlural]);

  return <></>;
};
