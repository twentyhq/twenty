import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type View } from '@/views/types/View';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

import { isDefined } from 'twenty-shared/utils';

export const useOpenCreateViewDropdown = (viewBardId?: string) => {
  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
    viewBardId,
  );

  const { setViewPickerMode } = useViewPickerMode(viewBardId);

  const { openDropdown } = useOpenDropdown();

  const openCreateViewDropdown = (referenceView: View | undefined) => {
    if (isDefined(referenceView?.id)) {
      setViewPickerReferenceViewId(referenceView.id);
      setViewPickerMode('create-empty');
      openDropdown({
        dropdownComponentInstanceIdFromProps: VIEW_PICKER_DROPDOWN_ID,
      });
    }
  };

  return { openCreateViewDropdown };
};
