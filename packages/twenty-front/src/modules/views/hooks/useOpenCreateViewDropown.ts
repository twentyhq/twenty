import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getViewPickerDropdownId } from '@/views/view-picker/utils/getViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

import { isDefined } from 'twenty-shared/utils';

export const useOpenCreateViewDropdown = (viewBardId?: string) => {
  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
    viewBardId,
  );

  const { setViewPickerMode } = useViewPickerMode(viewBardId);

  const { openDropdown } = useOpenDropdown();
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const openCreateViewDropdown = (referenceView: View | undefined) => {
    if (isDefined(referenceView?.id)) {
      setViewPickerReferenceViewId(referenceView.id);
      setViewPickerMode('create-empty');
      openDropdown({
        dropdownComponentInstanceIdFromProps:
          getViewPickerDropdownId(recordIndexId),
      });
    }
  };

  return { openCreateViewDropdown };
};
