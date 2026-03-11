import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelNewSidebarItemViewPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewPickerSubView';
import { selectedObjectMetadataIdForViewFlowState } from '@/side-panel/states/selectedObjectMetadataIdForViewFlowState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelNewSidebarItemViewPickerSubPage = () => {
  const selectedObjectMetadataIdForViewFlow = useAtomComponentStateValue(
    selectedObjectMetadataIdForViewFlowState,
  );
  const setSelectedObjectMetadataIdForViewFlow = useSetAtomComponentState(
    selectedObjectMetadataIdForViewFlowState,
  );
  const { goBackFromSidePanelSubPage } = useSidePanelSubPageHistory();

  useEffect(() => {
    return () => {
      setSelectedObjectMetadataIdForViewFlow(null);
    };
  }, [setSelectedObjectMetadataIdForViewFlow]);

  if (!isDefined(selectedObjectMetadataIdForViewFlow)) {
    goBackFromSidePanelSubPage();
    return null;
  }

  return (
    <SidePanelNewSidebarItemViewPickerSubView
      selectedObjectMetadataIdForView={selectedObjectMetadataIdForViewFlow}
    />
  );
};
