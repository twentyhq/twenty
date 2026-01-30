import { RUN_EVALUATION_INPUT } from '@/ai/graphql/mutations/runEvaluationInput';
import { GET_AGENT_TURNS } from '@/ai/graphql/queries/getAgentTurns';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconDotsVertical,
  IconMessage,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from 'twenty-ui/display';
import { Button, LightIconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SETTINGS_AGENT_DETAIL_TABS } from '~/pages/settings/ai/constants/SettingsAgentDetailTabs';

const DELETE_EVAL_INPUT_MODAL_ID = 'delete-eval-input-modal';

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledEmptyMessage = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type SettingsAgentEvalsTabProps = {
  agentId: string;
  evaluationInputs: string[];
  onEvaluationInputsChange: (inputs: string[]) => void;
  disabled?: boolean;
};

type EvalInput = {
  id: string;
  text: string;
};

export const SettingsAgentEvalsTab = ({
  agentId,
  evaluationInputs,
  onEvaluationInputsChange,
  disabled = false,
}: SettingsAgentEvalsTabProps) => {
  const [newInput, setNewInput] = useState('');
  const [inputToDelete, setInputToDelete] = useState<string | null>(null);
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const tabListComponentId = `${SETTINGS_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const [runEvaluationInput] = useMutation(RUN_EVALUATION_INPUT, {
    onCompleted: () => {
      const logsTabId = SETTINGS_AGENT_DETAIL_TABS.TABS_IDS.LOGS;
      setActiveTabId(logsTabId);
      navigate(`#${logsTabId}`);
    },
    onError: () => {
      enqueueErrorSnackBar({
        message: t`Failed to execute evaluation input`,
      });
    },
    refetchQueries: [getOperationName(GET_AGENT_TURNS) ?? ''],
    awaitRefetchQueries: false,
  });

  const evalInputs: EvalInput[] = evaluationInputs.map((text) => ({
    id: uuidv4(),
    text,
  }));

  const handleAddInput = () => {
    if (newInput.trim() !== '') {
      onEvaluationInputsChange([...evaluationInputs, newInput.trim()]);
      setNewInput('');
    }
  };

  const handleDeleteInput = () => {
    if (inputToDelete !== null) {
      const index = evalInputs.findIndex((input) => input.id === inputToDelete);
      if (index !== -1) {
        const newInputs = [...evaluationInputs];
        newInputs.splice(index, 1);
        onEvaluationInputsChange(newInputs);
      }
      setInputToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setInputToDelete(id);
    openModal(DELETE_EVAL_INPUT_MODAL_ID);
  };

  const handleRunInput = (text: string, itemId: string) => {
    runEvaluationInput({
      variables: { agentId, input: text },
    });
    closeDropdown(`eval-input-dropdown-${itemId}`);
  };

  return (
    <>
      <Section>
        <StyledInputContainer>
          <TextInput
            placeholder={t`Add test input for evaluation (e.g., "Find all customers in NY")`}
            value={newInput}
            onChange={setNewInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInput();
              }
            }}
            disabled={disabled}
            fullWidth
          />
          <Button
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            title={t`Add`}
            onClick={handleAddInput}
            disabled={disabled || !newInput.trim()}
          />
        </StyledInputContainer>

        {evalInputs.length > 0 ? (
          <SettingsListCard
            items={evalInputs}
            getItemLabel={(item) => item.text}
            RowIcon={IconMessage}
            RowRightComponent={({ item }) => (
              <Dropdown
                dropdownId={`eval-input-dropdown-${item.id}`}
                dropdownPlacement="right-start"
                clickableComponent={
                  <LightIconButton
                    Icon={IconDotsVertical}
                    accent="tertiary"
                    disabled={disabled}
                  />
                }
                dropdownComponents={
                  <DropdownContent>
                    <DropdownMenuItemsContainer>
                      <MenuItem
                        LeftIcon={IconPlayerPlay}
                        text={t`Run`}
                        onClick={() => handleRunInput(item.text, item.id)}
                      />
                      <MenuItem
                        accent="danger"
                        LeftIcon={IconTrash}
                        text={t`Delete`}
                        onClick={() => openDeleteModal(item.id)}
                      />
                    </DropdownMenuItemsContainer>
                  </DropdownContent>
                }
              />
            )}
            hasFooter={false}
          />
        ) : (
          <StyledEmptyMessage>{t`No evaluation inputs yet. Add your first test input above.`}</StyledEmptyMessage>
        )}
      </Section>

      <ConfirmationModal
        modalId={DELETE_EVAL_INPUT_MODAL_ID}
        title={t`Delete Evaluation Input`}
        subtitle={t`Are you sure you want to delete this evaluation input?`}
        onConfirmClick={handleDeleteInput}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
