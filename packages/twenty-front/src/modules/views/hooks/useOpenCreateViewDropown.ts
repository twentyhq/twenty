import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerParentViewIdComponentState } from '@/views/view-picker/states/viewPickerParentViewIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

import { isDefined } from 'twenty-shared/utils';

export const useOpenCreateViewDropdown = (viewBardId?: string) => {
  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
    viewBardId,
  );

  const setViewPickerParentViewId = useSetAtomComponentState(
    viewPickerParentViewIdComponentState,
    viewBardId,
  );

  const { setViewPickerMode } = useViewPickerMode(viewBardId);

  const { openDropdown } = useOpenDropdown();

  const openCreateViewDropdown = (
    referenceView: View | undefined,
    parentViewId?: string,
  ) => {
    if (isDefined(referenceView?.id)) {
      setViewPickerReferenceViewId(referenceView.id);
      setViewPickerParentViewId(parentViewId ?? '');
      setViewPickerMode('create-empty');
      openDropdown({
        dropdownComponentInstanceIdFromProps: VIEW_PICKER_DROPDOWN_ID,
      });
    }
  };

  return { openCreateViewDropdown };
};
