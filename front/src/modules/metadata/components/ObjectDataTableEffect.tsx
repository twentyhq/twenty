import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';

import { useFindManyObjects } from './hooks';
import { useSetObjectDataTableData } from './useSetDataTableData';

export const ObjectDataTableEffect = ({
  objectName,
  objectNameSingular,
}: {
  objectNameSingular: string;
  objectName: string;
}) => {
  const setDataTableData = useSetObjectDataTableData();

  const { data } = useFindManyObjects({ objectName });

  useEffect(() => {
    const entities = data?.['findMany' + objectNameSingular]?.edges ?? [];

    setDataTableData(entities);
  }, [data, objectNameSingular, setDataTableData]);

  const [searchParams] = useSearchParams();
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentView = await snapshot.getPromise(
          currentViewIdScopedState(tableRecoilScopeId),
        );
        if (currentView === viewId) {
          return;
        }

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState(viewId),
        );

        set(filtersScopedState(tableRecoilScopeId), savedFilters);
        set(sortsScopedState(tableRecoilScopeId), savedSorts);
        set(currentViewIdScopedState(tableRecoilScopeId), viewId);
      },
    [tableRecoilScopeId],
  );

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewSelect(viewId);
    }
  }, [handleViewSelect, searchParams]);

  return <></>;
};
