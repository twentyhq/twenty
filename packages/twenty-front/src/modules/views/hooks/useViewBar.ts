import { useSetRecoilState } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useHandleCurrentViewFields } from '@/views/hooks/internal/useHandleCurrentViewFields';
import { useHandleCurrentViewFilterAndSorts } from '@/views/hooks/internal/useHandleCurrentViewFilterAndSorts';
import { useHandleViews } from '@/views/hooks/internal/useHandleViews';
import { useViewStates } from '@/views/hooks/internal/useViewStates';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

export const useViewBar = (viewBarComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewBarComponentId,
  );

  const {
    currentViewIdState,
    availableFieldDefinitionsState,
    availableSortDefinitionsState,
    availableFilterDefinitionsState,
    entityCountInCurrentViewState,
    viewObjectMetadataIdState,
    viewEditModeState,
  } = useViewStates(componentId);

  const setCurrentViewId = useSetRecoilState(currentViewIdState);
  const setAvailableFieldDefinitions = useSetRecoilState(
    availableFieldDefinitionsState,
  );
  const setAvailableSortDefinitions = useSetRecoilState(
    availableSortDefinitionsState,
  );
  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState,
  );
  const setEntityCountInCurrentView = useSetRecoilState(
    entityCountInCurrentViewState,
  );
  const setViewObjectMetadataId = useSetRecoilState(viewObjectMetadataIdState);

  const { resetCurrentViewFilterAndSorts, updateCurrentViewFilterAndSorts } =
    useHandleCurrentViewFilterAndSorts(viewBarComponentId);

  const { persistViewFields } = useHandleCurrentViewFields(viewBarComponentId);

  const {
    selectView,
    removeView,
    createEmptyView,
    createViewFromCurrent,
    updateCurrentView,
  } = useHandleViews(viewBarComponentId);

  return {
    componentId,

    viewEditModeState,

    setCurrentViewId,
    setAvailableFieldDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setEntityCountInCurrentView,
    setViewObjectMetadataId,
    updateCurrentViewFilterAndSorts,
    resetCurrentViewFilterAndSorts,
    persistViewFields,
    selectView,
    removeView,
    createEmptyView,
    createViewFromCurrent,
    updateCurrentView,
  };
};
