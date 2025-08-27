import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useGetAiAgentConfig } from '@/object-record/record-group/hooks/useGetAiAgentConfig';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { createPortal } from 'react-dom';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { THEME_COMMON } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { useCreateAiAgentConfig } from '@/object-record/record-group/hooks/useCreateAiAgentConfig';
import { useDeleteAiAgentConfig } from '@/object-record/record-group/hooks/useDeleteAiAgentConfig';
import { useGetAgents } from '@/object-record/record-group/hooks/useGetAgents';
import { useUpdateAiAgentConfig } from '@/object-record/record-group/hooks/useUpdateAiAgentConfig';

const RIGHT_DRAWER_ANIMATION_VARIANTS = {
  normal: {
    x: '0%',
    width: THEME_COMMON.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: '0',
  },
  closed: {
    x: '100%',
    width: THEME_COMMON.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: 'auto',
  },
  fullScreen: {
    x: '0%',
    width: '100%',
    height: '100%',
    bottom: '0',
    top: '0',
  },
};

const StyledRightDrawer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: fixed;
  right: 0%;
  top: 0%;
  z-index: ${RootStackingContextZIndices.RootModal};
  display: flex;
  flex-direction: column;
`;

const StyledDrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)};
  height: 100%;
  overflow-y: auto;
`;

const StyledTitle = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledToggleField = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledToggleInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledToggleStatus = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export type AIWorkflowSetupDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  objectMetadataId?: string;
  viewGroupId?: string;
  viewId?: string;
  fieldMetadataId?: string;
};

export const AIWorkflowSetupDrawer = ({
  isOpen,
  onClose,
  workspaceId,
  objectMetadataId,
  viewGroupId,
  viewId,
  fieldMetadataId,
}: AIWorkflowSetupDrawerProps) => {
  const isMobile = useIsMobile();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { createAiAgentConfig, loading: isCreating } = useCreateAiAgentConfig();
  const { updateAiAgentConfig, loading: isUpdating } = useUpdateAiAgentConfig();
  const { deleteAiAgentConfig, loading: isDeleting } = useDeleteAiAgentConfig();

  const isSubmitting = isCreating || isUpdating || isDeleting;

  // Fetch existing AI agent config for this context
  const {
    aiAgentConfig,
    loading: isLoadingConfig,
    error: configError,
    refetch,
  } = useGetAiAgentConfig({
    objectMetadataId,
    fieldMetadataId,
    viewGroupId,
    viewId,
  });

  // Fetch available agents dynamically
  const {
    agents,
    agentOptions,
    loading: isLoadingAgents,
    error: agentsError,
  } = useGetAgents();

  const [agentSelection, setAgentSelection] = useState('');
  const [wipLimit, setWipLimit] = useState('1');
  const [additionalInput, setAdditionalInput] = useState('');
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [errors, setErrors] = useState<{
    wipLimit?: string;
    additionalInput?: string;
    agentSelection?: string;
  }>({});

  const targetVariant = isMobile ? 'fullScreen' : 'normal';

  // Populate form with existing data when config is loaded
  useEffect(() => {
    if (aiAgentConfig && isOpen) {
      setAgentSelection(aiAgentConfig.agent || '');
      setWipLimit(aiAgentConfig.wipLimit?.toString() || '3');
      setAdditionalInput(aiAgentConfig.additionalInput || '');
      setWorkflowEnabled(aiAgentConfig.status === 'ENABLED');
      setErrors({});
    }
  }, [aiAgentConfig, isOpen]);

  // Separate effect for setting defaults when no config and agents are available
  useEffect(() => {
    if (isOpen && !isLoadingConfig && !aiAgentConfig && agents.length > 0 && agentSelection === '') {
      // Find the first valid agent (not the placeholder)
      const firstValidAgent = agents[0];
      if (firstValidAgent) {
        setAgentSelection(firstValidAgent.id);
        setWipLimit('1');
        setAdditionalInput('');
        setWorkflowEnabled(true);
        setErrors({});
      }
    }
  }, [isOpen, isLoadingConfig, aiAgentConfig, agents.length, agentSelection, agents]);

  const validateWipLimit = (value: string): string | undefined => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      return 'WIP Limit must be 1 or greater';
    }
    return undefined;
  };

  const validateAdditionalInput = (value: string): string | undefined => {
    if (value.length > 5000) {
      return 'Instructions must not exceed 5000 characters';
    }
    return undefined;
  };

  const validateAgentSelection = (value: string): string | undefined => {
    if (!value || value === '') {
      return 'Please select an agent';
    }
    // Check if no real agents are available (only the placeholder option)
    if (agents.length === 0) {
      return 'No agents available';
    }
    return undefined;
  };

  const handleWipLimitChange = (value: string) => {
    setWipLimit(value);
    const error = validateWipLimit(value);
    setErrors((prev) => ({ ...prev, wipLimit: error }));
  };

  const handleAdditionalInputChange = (value: string) => {
    setAdditionalInput(value);
    const error = validateAdditionalInput(value);
    setErrors(prev => ({ ...prev, additionalInput: error }));
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = async () => {
    if (!aiAgentConfig?.id) {
      return;
    }

    try {
      await deleteAiAgentConfig(aiAgentConfig.id);

      // Refetch to get the latest data (should show no config now)
      if (refetch) {
        await refetch();
      }

      // Clear form inputs after successful delete
      setAgentSelection(agentOptions[0]?.value || '');
      setWipLimit('1');
      setAdditionalInput('');
      setWorkflowEnabled(true);
      setErrors({});

      onClose();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to delete AI agent config:', error);
    }
  };

  const handleSave = async () => {
    // Validate all fields before saving
    const wipLimitError = validateWipLimit(wipLimit);
    const additionalInputError = validateAdditionalInput(additionalInput);
    const agentSelectionError = validateAgentSelection(agentSelection);

    if (wipLimitError || additionalInputError || agentSelectionError) {
      setErrors({
        wipLimit: wipLimitError,
        additionalInput: additionalInputError,
        agentSelection: agentSelectionError,
      });
      return;
    }

    // Check required fields
    if (
      !workspaceId ||
      !objectMetadataId ||
      !viewGroupId ||
      !viewId ||
      !fieldMetadataId
    ) {
      console.error('Missing required fields for AI agent config creation');
      return;
    }

    try {
      if (aiAgentConfig?.id) {
        // Update existing configuration
        const updateInput = {
          objectMetadataId,
          viewId,
          fieldMetadataId,
          viewGroupId,
          agent: agentSelection,
          wipLimit: parseInt(wipLimit, 10),
          additionalInput,
          status: workflowEnabled
            ? ('ENABLED' as const)
            : ('DISABLED' as const),
        };

        await updateAiAgentConfig(aiAgentConfig.id, updateInput);
      } else {
        // Create new configuration
        const createInput = {
          workspaceId,
          agent: agentSelection,
          fieldMetadataId,
          objectMetadataId,
          wipLimit: parseInt(wipLimit, 10),
          additionalInput,
          viewGroupId,
          viewId,
          status: workflowEnabled
            ? ('ENABLED' as const)
            : ('DISABLED' as const),
        };

        await createAiAgentConfig(createInput);
      }

      // Refetch to get the latest data
      if (refetch) {
        await refetch();
      }

      // Clear form inputs after successful save
      setAgentSelection(agentOptions[0]?.value || '');
      setWipLimit('1');
      setAdditionalInput('');
      setWorkflowEnabled(true);
      setErrors({});

      onClose();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to save AI agent config:', error);
    }
  };

  useListenToSidePanelClosing(onClose);

  useListenClickOutside({
    refs: [drawerRef],
    callback: (event) => {
      // Check if the click is within a dropdown by looking for data-select-disable
      const target = event.target as HTMLElement;
      let currentElement = target;
      while (currentElement) {
        if (currentElement.hasAttribute('data-select-disable')) {
          return; // Don't close if clicking within a dropdown
        }
        currentElement = currentElement.parentElement as HTMLElement;
      }
      onClose();
    },
    listenerId: 'AI_WORKFLOW_SETUP_DRAWER_LISTENER_ID',
  });

  return (
    <>
      {createPortal(
    <AnimatePresence>
      {isOpen && (
        <StyledRightDrawer
          ref={drawerRef}
          data-testid="ai-workflow-setup-drawer"
          animate={targetVariant}
          initial="closed"
          exit="closed"
          variants={RIGHT_DRAWER_ANIMATION_VARIANTS}
          transition={{ duration: 0.2 }}
        >
          <StyledDrawerContent>
            <StyledTitle>
              <H1Title
                title={
                  aiAgentConfig?.id
                    ? `Edit Workflow Configuration`
                    : `Configure Workflow`
                }
                fontColor={H1TitleFontColor.Primary}
              />
              <StyledDescription>
                {aiAgentConfig?.id
                  ? `Update the settings for your automated workflow execution.`
                  : `Adjust the settings for your automated workflow execution.`}
              </StyledDescription>
            </StyledTitle>
            <StyledFormField>
              <StyledLabel>{`Agent Selection`}</StyledLabel>
              <Select
                value={agentSelection}
                onChange={(value: string) => {
                  setAgentSelection(value);
                  // Clear validation error when user selects an agent
                  
                  if (value && value !== '') {
                    setErrors(prev => ({ ...prev, agentSelection: undefined }));
                  }
                }}
                options={agentOptions}
                dropdownId="ai-workflow-agent-select"
                isDropdownInModal={true}
                // fullWidth
                // disabled={isLoadingAgents}
              />
              <StyledDescription>
                {isLoadingAgents
                  ? `Loading available agents...`
                  : agentsError
                    ? `Error loading agents. Please try again.`
                    : `Select an agent to execute the workflow.`}
              </StyledDescription>
              {errors.agentSelection && (
                <StyledDescription style={{ color: 'red' }}>
                  {errors.agentSelection}
                </StyledDescription>
              )}
            </StyledFormField>

            <StyledFormField>
              <StyledLabel>{`WIP Limit`}</StyledLabel>
              <TextInput
                value={wipLimit}
                onChange={handleWipLimitChange}
                type="number"
                fullWidth
                error={errors.wipLimit}
              />
              <StyledDescription>
                {`Number of elements to process per batch (minimum 1, e.g., every minute).`}
              </StyledDescription>
            </StyledFormField>

            <StyledFormField>
              <StyledLabel>{`Instructions`}</StyledLabel>
              <TextArea
                textAreaId="ai-workflow-instructions"
                value={additionalInput}
                onChange={handleAdditionalInputChange}
                placeholder={`Provide instructions for the agent...`}
                minRows={8}
                maxRows={8}
              />
              <StyledDescription>
                {`Optional: additional content to pass to the triggered agent. ${additionalInput.length}/5000 characters`}
              </StyledDescription>
              {errors.additionalInput && (
                <StyledDescription style={{ color: 'red' }}>
                  {errors.additionalInput}
                </StyledDescription>
              )}
            </StyledFormField>

            <StyledToggleField>
              <StyledToggleInfo>
                <StyledLabel>{`Workflow Status`}</StyledLabel>
                <StyledToggleStatus>
                  {workflowEnabled ? `Enabled (Workflow is active)` : `Disabled (Workflow is inactive)`}
                </StyledToggleStatus>
              </StyledToggleInfo>
              <Toggle
                value={workflowEnabled}
                onChange={setWorkflowEnabled}
              />
            </StyledToggleField>
          </StyledDrawerContent>

          <RightDrawerFooter
            actions={[
              <Button
                key="cancel"
                variant="secondary"
                accent="default"
                title={`Cancel`}
                onClick={handleCancel}
              />, 
              ...(aiAgentConfig?.id ? [
                <Button
                  key="delete"
                  variant="secondary"
                  accent="danger"
                  title={`Delete Workflow`}
                  onClick={handleDelete}
                  disabled={isSubmitting || isLoadingConfig || isLoadingAgents}
                />
              ] : []),
              <Button
                key="save"
                variant="primary"
                accent="blue"
                title={aiAgentConfig?.id ? `Update Workflow` : `Save Workflow`}
                onClick={handleSave}
                disabled={isSubmitting || isLoadingConfig || isLoadingAgents || agents.length === 0}
              />,
            ]}
          />
        </StyledRightDrawer>
      )}
    </AnimatePresence>,
    document.body,
  )}
    </>
  );
};