import { useSetRecoilState } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { getViewScopedStates } from '../utils/internal/getViewScopedStates';

export const useViewSetStates = (viewScopeId?: string, viewId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );

  // View
  const {
    viewObjectIdState,
    viewTypeState,
    viewsState,
    viewEditModeState,

    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewSortsState,
    entityCountInCurrentViewState,
    isViewBarExpandedState,
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    savedViewFieldsState,
    savedViewFiltersState,
    savedViewSortsState,
    currentViewIdState,
  } = getViewScopedStates({
    viewScopeId: scopeId,
    viewId: viewId ?? UNDEFINED_FAMILY_ITEM_ID,
  });

  const setCurrentViewId = useSetRecoilState(currentViewIdState);
  const setViewObjectId = useSetRecoilState(viewObjectIdState);
  const setViewType = useSetRecoilState(viewTypeState);
  const setViews = useSetRecoilState(viewsState);
  const setViewEditMode = useSetRecoilState(viewEditModeState);
  const setAvailableSortDefinitions = useSetRecoilState(
    availableSortDefinitionsState,
  );

  const setEntityCountInCurrentView = useSetRecoilState(
    entityCountInCurrentViewState,
  );

  const setIsViewBarExpanded = useSetRecoilState(isViewBarExpandedState);

  // ViewSorts
  const setCurrentViewSorts = useSetRecoilState(currentViewSortsState);

  const setSavedViewSorts = useSetRecoilState(savedViewSortsState);

  // ViewFilters
  const setCurrentViewFilters = useSetRecoilState(currentViewFiltersState);

  const setSavedViewFilters = useSetRecoilState(savedViewFiltersState);

  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState,
  );

  // ViewFields
  const setAvailableFieldDefinitions = useSetRecoilState(
    availableFieldDefinitionsState,
  );

  const setCurrentViewFields = useSetRecoilState(currentViewFieldsState);

  const setSavedViewFields = useSetRecoilState(savedViewFieldsState);

  const setOnViewFieldsChange = useSetRecoilState(onViewFieldsChangeState);

  const setOnViewFiltersChange = useSetRecoilState(onViewFiltersChangeState);

  const setOnViewSortsChange = useSetRecoilState(onViewSortsChangeState);

  return {
    setCurrentViewId,
    setIsViewBarExpanded,
    setViewObjectId,
    setViewType,

    setViews,
    setViewEditMode,
    setEntityCountInCurrentView,

    setAvailableSortDefinitions,
    setCurrentViewSorts,
    setSavedViewSorts,

    setAvailableFilterDefinitions,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFieldDefinitions,
    setCurrentViewFields,
    setSavedViewFields,

    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
  };
};
