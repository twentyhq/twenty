import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';

import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useSetObjectDataTableData } from '../hooks/useSetDataTableData';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

export type ObjectDataTableEffectProps = Pick<
  MetadataObjectIdentifier,
  'objectNamePlural'
>;

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

  const [searchParams] = useSearchParams();
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewId: string) => {
        const currentView = snapshot
          .getLoadable(
            currentViewIdScopedState({ scopeId: tableRecoilScopeId }),
          )
          .getValue();

        if (currentView === viewId) {
          return;
        }

        set(currentViewIdScopedState({ scopeId: tableRecoilScopeId }), viewId);
      },
    [tableRecoilScopeId],
  );

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewSelect(viewId);
    }
  }, [handleViewSelect, searchParams, objectNamePlural]);

  return <></>;
};
