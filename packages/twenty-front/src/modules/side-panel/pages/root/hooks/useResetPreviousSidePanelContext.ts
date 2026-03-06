import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';

export const useResetPreviousSidePanelContext = () => {
  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { resetContextStoreStates } = useResetContextStoreStates();

  const resetPreviousSidePanelContext = () => {
    copyContextStoreStates({
      instanceIdToCopyFrom: SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
      instanceIdToCopyTo: SIDE_PANEL_COMPONENT_INSTANCE_ID,
    });
    resetContextStoreStates(SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID);
  };

  return {
    resetPreviousSidePanelContext,
  };
};
