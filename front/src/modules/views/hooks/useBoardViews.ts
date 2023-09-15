import type { Context } from 'react';

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
  scopeContext,
}: {
  fieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  objectId: 'company';
  scopeContext: Context<string | null>;
}) => {
  const boardCardFields = useRecoilScopedValue(
    boardCardFieldsScopedState,
    scopeContext,
  );
  const filters = useRecoilScopedValue(filtersScopedState, scopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, scopeContext);

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(boardCardFields, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Pipeline,
    scopeContext,
  });

  const { createViewFields, persistCardFields } = useBoardViewFields({
    objectId,
    fieldDefinitions,
    scopeContext,
    skipFetch: isFetchingViews,
  });

  const { createViewFilters, persistFilters } = useViewFilters({
    scopeContext,
    skipFetch: isFetchingViews,
  });

  const { createViewSorts, persistSorts } = useViewSorts({
    scopeContext,
    skipFetch: isFetchingViews,
  });

  const submitCurrentView = async () => {
    await persistCardFields();
    await persistFilters();
    await persistSorts();
  };

  return { createView, deleteView, submitCurrentView, updateView };
};
