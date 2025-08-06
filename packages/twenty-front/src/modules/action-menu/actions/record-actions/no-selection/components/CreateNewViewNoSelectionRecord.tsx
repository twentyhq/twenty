import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const CreateNewViewNoSelectionRecord = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const { openDropdown } = useOpenDropdown();

  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!currentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    currentViewId,
  );

  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
    recordIndexId,
  );

  const { setViewPickerMode } = useViewPickerMode(recordIndexId);

  const handleAddViewButtonClick = () => {
    setViewPickerReferenceViewId(currentViewId);
    setViewPickerMode('create-empty');
    openDropdown({
      dropdownComponentInstanceIdFromProps: VIEW_PICKER_DROPDOWN_ID,
    });
  };

  return <Action onClick={handleAddViewButtonClick} />;
};
