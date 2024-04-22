import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';

import { ViewScopeInternalContext } from '../../scopes/scope-internal-context/ViewScopeInternalContext';

export const useViewPickerStates = (viewComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewComponentId,
  );

  return {
    componentId,
    viewPickerModeState: extractComponentState(
      viewPickerModeComponentState,
      componentId,
    ),
    viewPickerInputNameState: extractComponentState(
      viewPickerInputNameComponentState,
      componentId,
    ),
    viewPickerSelectedIconState: extractComponentState(
      viewPickerSelectedIconComponentState,
      componentId,
    ),
    viewPickerKanbanFieldMetadataIdState: extractComponentState(
      viewPickerKanbanFieldMetadataIdComponentState,
      componentId,
    ),
    viewPickerReferenceViewIdState: extractComponentState(
      viewPickerReferenceViewIdComponentState,
      componentId,
    ),
    viewPickerIsPersistingState: extractComponentState(
      viewPickerIsPersistingComponentState,
      componentId,
    ),
    viewPickerTypeState: extractComponentState(
      viewPickerTypeComponentState,
      componentId,
    ),
    viewPickerIsDirtyState: extractComponentState(
      viewPickerIsDirtyComponentState,
      componentId,
    ),
  };
};
