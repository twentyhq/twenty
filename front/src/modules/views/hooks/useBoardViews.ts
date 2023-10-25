import { useSearchParams } from 'react-router-dom';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { useSort } from '@/ui/data/sort/hooks/useSort';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { useBoardColumns } from '@/ui/layout/board/hooks/useBoardColumns';
import { boardCardFieldsScopedState } from '@/ui/layout/board/states/boardCardFieldsScopedState';
import { BoardFieldDefinition } from '@/ui/layout/board/types/BoardFieldDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewType } from '~/generated/graphql';

import { useBoardViewFields } from './useBoardViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSortsInternal';

export const useBoardViews = ({
  viewScopeId,
  fieldDefinitions,
  objectId,
  RecoilScopeContext,
}: {
  viewScopeId: string;
  fieldDefinitions: BoardFieldDefinition<FieldMetadata>[];
  objectId: 'company';
  RecoilScopeContext: RecoilScopeContext;
}) => {
  const boardCardFields = useRecoilScopedValue(
    boardCardFieldsScopedState,
    RecoilScopeContext,
  );
  const filters = useRecoilScopedValue(filtersScopedState, RecoilScopeContext);
  const { sorts } = useSort();

  const [_, setSearchParams] = useSearchParams();

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(boardCardFields, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
    setSearchParams({ view: viewId });
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
    viewScopeId: viewScopeId,
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Pipeline,
    RecoilScopeContext,
  });

  const { createViewFields, persistCardFields } = useBoardViewFields({
    objectId,
    viewFieldDefinition: fieldDefinitions,
    skipFetch: isFetchingViews,
    RecoilScopeContext,
  });

  const { persistBoardColumns } = useBoardColumns();

  const { createViewFilters, persistFilters } = useViewFilters({
    skipFetch: isFetchingViews,
    RecoilScopeContext,
  });

  const { scopeId: sortScopeId } = useSort();

  const { createViewSorts, persistSorts } = useViewSorts({
    viewScopeId: viewScopeId,
    sortScopeId: sortScopeId,
    skipFetch: isFetchingViews,
  });

  const submitCurrentView = async () => {
    await persistCardFields();
    await persistBoardColumns();
    await persistFilters();
    await persistSorts();
  };

  return { createView, deleteView, submitCurrentView, updateView };
};
