import { RUN_EVALUATION_INPUT } from '@/ai/graphql/mutations/runEvaluationInput';
import { GET_AGENT_TURNS } from '@/ai/graphql/queries/getAgentTurns';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dropdown,
  LightIconButton,
  Section,
  useToast,
} from 'twenty-ui/components';
import {
  IconDotsVertical,
  IconMessage,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { v4 as uuidv4 } from 'uuid';
import { SETTINGS_AGENT_DETAIL_TABS } from '~/pages/settings/ai/constants/SettingsAgentDetailTabs';
import { getOperationName } from '~/utils/getOperationName';

const DELETE_EVAL_INPUT_MODAL_ID = 'delete-eval-input-modal';

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[6]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
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
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const navigate = useNavigate();

  const tabListComponentId = `${SETTINGS_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${agentId}`;
  const setActiveTabId = useSetAtomComponentState(
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
      enqueueToast({
        variant: 'error',
        children: t`Failed to execute evaluation input`,
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
    openDialog(DELETE_EVAL_INPUT_MODAL_ID);
  };

  const handleRunInput = (text: string) => {
    runEvaluationInput({
      variables: { agentId, input: text },
    });
  };

  return (
    <>
      <Section.Root>
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
            startIcon={<IconPlus />}
            size="sm"
            onClick={handleAddInput}
            disabled={disabled || !newInput.trim()}
            variant="solid"
            color="accent"
          >{t`Add`}</Button>
        </StyledInputContainer>

        {evalInputs.length > 0 ? (
          <SettingsListCard
            items={evalInputs}
            getItemLabel={(item) => item.text}
            RowIcon={IconMessage}
            RowRightComponent={({ item }) => (
              <DropdownRoot
                type="menu"
                dropdownId={`eval-input-dropdown-${item.id}`}
              >
                <Dropdown.Trigger
                  disabled={disabled}
                  render={
                    <LightIconButton
                      emphasis="subtle"
                      disabled={disabled}
                      aria-label={t`More options`}
                    >
                      <IconDotsVertical />
                    </LightIconButton>
                  }
                />
                <Dropdown.Content side="right">
                  <Dropdown.Section>
                    <Dropdown.ActionItem
                      startIcon={<IconPlayerPlay />}
                      onClick={() => handleRunInput(item.text)}
                    >{t`Run`}</Dropdown.ActionItem>
                    <Dropdown.ActionItem
                      color="danger"
                      startIcon={<IconTrash />}
                      onClick={() => openDeleteModal(item.id)}
                    >{t`Delete`}</Dropdown.ActionItem>
                  </Dropdown.Section>
                </Dropdown.Content>
              </DropdownRoot>
            )}
            hasFooter={false}
          />
        ) : (
          <StyledEmptyMessage>{t`No evaluation inputs yet. Add your first test input above.`}</StyledEmptyMessage>
        )}
      </Section.Root>

      <ConfirmationDialog
        dialogId={DELETE_EVAL_INPUT_MODAL_ID}
        title={t`Delete Evaluation Input`}
        subtitle={t`Are you sure you want to delete this evaluation input?`}
        onConfirmClick={handleDeleteInput}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
