import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { getViewPickerDropdownId } from '@/views/view-picker/utils/getViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const CreateNewViewNoSelectionRecordCommand = () => {
  const { currentViewId, recordIndexId } = useHeadlessCommandContextApi();

  const { openDropdown } = useOpenDropdown();
  const { closeSidePanelMenu } = useSidePanelMenu();

  if (!isDefined(currentViewId) || !isDefined(recordIndexId)) {
    throw new Error(
      doNotTranslate(
        'Current view ID and record index ID are required to create new view',
      ),
    );
  }

  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
    recordIndexId,
  );

  const { setViewPickerMode } = useViewPickerMode(recordIndexId);

  const handleExecute = () => {
    closeSidePanelMenu();

    if (currentViewId) {
      setViewPickerReferenceViewId(currentViewId);
    }
    setViewPickerMode('create-empty');
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        getViewPickerDropdownId(recordIndexId),
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
