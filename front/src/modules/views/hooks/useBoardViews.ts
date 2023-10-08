import { useSearchParams } from 'react-router-dom';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { useBoardColumns } from '@/ui/board/hooks/useBoardColumns';
import { boardCardFieldsScopedState } from '@/ui/board/states/boardCardFieldsScopedState';
import { BoardFieldDefinition } from '@/ui/board/types/BoardFieldDefinition';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { ViewType } from '~/generated/graphql';

import { useBoardViewFields } from './useBoardViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSorts';

export const useBoardViews = ({
  fieldDefinitions,
  objectId,
  RecoilScopeContext,
}: {
  fieldDefinitions: BoardFieldDefinition<FieldMetadata>[];
  objectId: 'company';
  RecoilScopeContext: RecoilScopeContext;
}) => {
  const boardCardFields = useRecoilScopedValue(
    boardCardFieldsScopedState,
    RecoilScopeContext,
  );
  const filters = useRecoilScopedValue(filtersScopedState, RecoilScopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, RecoilScopeContext);

  const [_, setSearchParams] = useSearchParams();

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(boardCardFields, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
    setSearchParams({ view: viewId });
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
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

  const { createViewSorts, persistSorts } = useViewSorts({
    skipFetch: isFetchingViews,
    RecoilScopeContext,
  });

  const submitCurrentView = async () => {
    await persistCardFields();
    persistBoardColumns();
    await persistFilters();
    await persistSorts();
  };

  return { createView, deleteView, submitCurrentView, updateView };
};
