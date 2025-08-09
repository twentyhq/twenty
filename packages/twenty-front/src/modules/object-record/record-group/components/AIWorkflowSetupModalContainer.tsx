import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { AIWorkflowSetupDrawer } from '@/object-record/record-group/components/AIWorkflowSetupModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export type AIWorkflowSetupModalContainerProps = {
  recordGroupId: string;
};

export const AIWorkflowSetupModalContainer = ({ 
  recordGroupId 
}: AIWorkflowSetupModalContainerProps) => {
  const modalId = `ai-workflow-setup-${recordGroupId}`;

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    modalId,
  );

  const setIsModalOpened = useSetRecoilComponentState(
    isModalOpenedComponentState,
    modalId,
  );

  // Get context values for logging
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { selectFieldMetadataItem, objectMetadataItem } = useContext(RecordBoardContext);

  const handleClose = () => {
    setIsModalOpened(false);
  };

  return (
    <AIWorkflowSetupDrawer 
      isOpen={isModalOpened} 
      onClose={handleClose}
      workspaceId={currentWorkspace?.id}
      objectMetadataId={objectMetadataItem?.id}
      viewGroupId={recordGroupId}
      viewId={currentViewId}
      fieldMetadataId={selectFieldMetadataItem?.id}
    />
  );
}; 