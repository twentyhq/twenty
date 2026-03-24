import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const CreateNewViewNoSelectionRecordCommand = () => {
  const { currentViewId, recordIndexId } = useHeadlessCommandContextApi();

  const { openDropdown } = useOpenDropdown();

  if (!isDefined(currentViewId) || !isDefined(recordIndexId)) {
    throw new Error(
      'Current view ID and record index ID are required to create new view',
    );
  }

  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
    recordIndexId,
  );

  const { setViewPickerMode } = useViewPickerMode(recordIndexId);

  const handleExecute = () => {
    if (currentViewId) {
      setViewPickerReferenceViewId(currentViewId);
    }
    setViewPickerMode('create-empty');
    openDropdown({
      dropdownComponentInstanceIdFromProps: VIEW_PICKER_DROPDOWN_ID,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
