import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useGetAiAgentConfig } from '@/object-record/record-group/hooks/useGetAiAgentConfig';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { AppTooltip, IconRobot, TooltipDelay } from 'twenty-ui/display';

const StyledAIIndicator = styled.div<{ $isEnabled: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme, $isEnabled }) => 
    $isEnabled ? '#5a9dfb' : theme.color.gray50};
  cursor: pointer;
`;

const StyledIcon = styled(IconRobot)`
  width: 16px;
  height: 16px;
`;

type AIWorkflowIndicatorProps = {
  recordGroupId: string;
  viewId?: string;
  context?: 'table' | 'board';
};

export const AIWorkflowIndicator = ({ 
  recordGroupId, 
  viewId,
  context = 'board' 
}: AIWorkflowIndicatorProps) => {
  const { openModal } = useModal();

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );
  
  // Try to get context from table first, fall back to board context
  let objectMetadataItem;
  let fieldMetadataId = recordGroupFieldMetadata?.id;
  
  try {
    const tableContext = useRecordTableContextOrThrow();
    objectMetadataItem = tableContext.objectMetadataItem;
  } catch {
    // Fall back to board context if table context is not available
    const boardContext = useContext(RecordBoardContext);
    objectMetadataItem = boardContext?.objectMetadataItem;
    fieldMetadataId = boardContext?.selectFieldMetadataItem?.id;
  }

  const { aiAgentConfig, loading } = useGetAiAgentConfig({
    objectMetadataId: objectMetadataItem?.id,
    fieldMetadataId,
    viewGroupId: recordGroupId,
    viewId: viewId || currentViewId,
  });

  // Don't render anything if no workflow is configured or still loading
  if (loading || !aiAgentConfig?.id) {
    return null;
  }

  const indicatorId = `ai-workflow-indicator-${recordGroupId}`;

  const handleClick = () => {
    const modalId = `ai-workflow-setup-${recordGroupId}`;
    openModal(modalId);
  };

  return (
    <>
      <StyledAIIndicator 
        id={indicatorId} 
        $isEnabled={aiAgentConfig.status === 'ENABLED'}
        onClick={handleClick}
      >
        <StyledIcon />
      </StyledAIIndicator>
      <AppTooltip
        anchorSelect={`#${indicatorId}`}
        content={`AI Workflow: ${aiAgentConfig.agent} (${aiAgentConfig.status}) - Click to configure`}
        noArrow
        place="top"
        positionStrategy="fixed"
        delay={TooltipDelay.mediumDelay}
      />
    </>
  );
}; 