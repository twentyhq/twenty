import type { Context } from 'react';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import type { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import type { SortType } from '@/ui/view-bar/types/interface';
import { ViewType } from '~/generated/graphql';

import { useBoardViewFields } from './useBoardViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSorts';

export const useBoardViews = <Entity, SortField>({
  availableFilters,
  availableSorts,
  fieldDefinitions,
  objectId,
  scopeContext,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
  availableSorts: SortType<SortField>[];
  fieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  objectId: 'company';
  scopeContext: Context<string | null>;
}) => {
  const filters = useRecoilScopedValue(filtersScopedState, scopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, scopeContext);

  const { handleViewsChange, isFetchingViews } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Pipeline,
    scopeContext,
  });
  useBoardViewFields({
    objectId,
    fieldDefinitions,
    scopeContext,
    skipFetch: isFetchingViews,
  });
  const { createViewFilters, persistFilters } = useViewFilters({
    availableFilters,
    scopeContext,
    skipFetch: isFetchingViews,
  });
  const { createViewSorts, persistSorts } = useViewSorts({
    availableSorts,
    scopeContext,
    skipFetch: isFetchingViews,
  });

  async function handleViewCreate(viewId: string) {
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
  }

  const handleViewSubmit = async () => {
    await persistFilters();
    await persistSorts();
  };

  return { handleViewsChange, handleViewSubmit };
};
