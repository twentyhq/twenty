import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/extractComponentReadOnlySelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { availableFieldDefinitionsComponentState } from '@/views/states/availableFieldDefinitionsComponentState';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { entityCountInCurrentViewComponentState } from '@/views/states/entityCountInCurrentViewComponentState';
import { isCurrentViewKeyIndexComponentState } from '@/views/states/isCurrentViewIndexComponentState';
import { isPersistingViewFieldsComponentState } from '@/views/states/isPersistingViewFieldsComponentState';
import { isViewBarExpandedComponentState } from '@/views/states/isViewBarExpandedComponentState';
import { onCurrentViewChangeComponentState } from '@/views/states/onCurrentViewChangeComponentState';
import { canPersistViewComponentSelector } from '@/views/states/selectors/canPersistViewComponentSelector';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';

import { ViewScopeInternalContext } from '../../scopes/scope-internal-context/ViewScopeInternalContext';

export const useViewStates = (viewComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewComponentId,
  );

  return {
    componentId,
    currentViewIdState: extractComponentState(
      currentViewIdComponentState,
      componentId,
    ),
    availableFieldDefinitionsState: extractComponentState(
      availableFieldDefinitionsComponentState,
      componentId,
    ),
    availableFilterDefinitionsState: extractComponentState(
      availableFilterDefinitionsComponentState,
      componentId,
    ),
    availableSortDefinitionsState: extractComponentState(
      availableSortDefinitionsComponentState,
      componentId,
    ),
    canPersistViewSelector: extractComponentReadOnlySelector(
      canPersistViewComponentSelector,
      componentId,
    ),
    isViewBarExpandedState: extractComponentState(
      isViewBarExpandedComponentState,
      componentId,
    ),
    onCurrentViewChangeState: extractComponentState(
      onCurrentViewChangeComponentState,
      componentId,
    ),
    entityCountInCurrentViewState: extractComponentState(
      entityCountInCurrentViewComponentState,
      componentId,
    ),
    viewObjectMetadataIdState: extractComponentState(
      viewObjectMetadataIdComponentState,
      componentId,
    ),
    unsavedToUpsertViewFiltersState: extractComponentState(
      unsavedToUpsertViewFiltersComponentState,
      componentId,
    ),
    unsavedToUpsertViewSortsState: extractComponentState(
      unsavedToUpsertViewSortsComponentState,
      componentId,
    ),
    unsavedToDeleteViewFilterIdsState: extractComponentState(
      unsavedToDeleteViewFilterIdsComponentState,
      componentId,
    ),
    unsavedToDeleteViewSortIdsState: extractComponentState(
      unsavedToDeleteViewSortIdsComponentState,
      componentId,
    ),
    isPersistingViewFieldsState: extractComponentState(
      isPersistingViewFieldsComponentState,
      componentId,
    ),
    isCurrentViewKeyIndexState: extractComponentState(
      isCurrentViewKeyIndexComponentState,
      componentId,
    ),
  };
};
