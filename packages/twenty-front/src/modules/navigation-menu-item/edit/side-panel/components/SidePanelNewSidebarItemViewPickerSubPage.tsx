import { SidePanelNewSidebarItemViewPickerSubView } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemViewPickerSubView';
import { selectedObjectMetadataIdForViewFlowState } from '@/side-panel/states/selectedObjectMetadataIdForViewFlowState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelNewSidebarItemViewPickerSubPage = () => {
  const selectedObjectMetadataIdForViewFlow = useAtomComponentStateValue(
    selectedObjectMetadataIdForViewFlowState,
  );

  if (!isDefined(selectedObjectMetadataIdForViewFlow)) {
    return null;
  }

  return (
    <SidePanelNewSidebarItemViewPickerSubView
      selectedObjectMetadataIdForView={selectedObjectMetadataIdForViewFlow}
    />
  );
};
