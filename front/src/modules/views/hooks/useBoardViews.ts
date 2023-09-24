import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { boardCardFieldsScopedState } from '@/ui/board/states/boardCardFieldsScopedState';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
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
  fieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  objectId: 'company';
  RecoilScopeContext: RecoilScopeContext;
}) => {
  const boardCardFields = useRecoilScopedValue(
    boardCardFieldsScopedState,
    RecoilScopeContext,
  );
  const filters = useRecoilScopedValue(filtersScopedState, RecoilScopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, RecoilScopeContext);

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(boardCardFields, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Pipeline,
    RecoilScopeContext,
  });

  const { createViewFields, persistCardFields, persistBoardColumns } =
    useBoardViewFields({
      objectId,
      fieldDefinitions,
      skipFetch: isFetchingViews,
      RecoilScopeContext,
    });

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
    await persistBoardColumns();
    await persistFilters();
    await persistSorts();
  };

  return { createView, deleteView, submitCurrentView, updateView };
};
