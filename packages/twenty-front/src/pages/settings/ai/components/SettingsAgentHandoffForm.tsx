import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { IconPlus } from 'twenty-ui/display';
import { Button, SelectOption } from 'twenty-ui/input';
import { useCreateAgentHandoffMutation } from '~/generated-metadata/graphql';

const StyledAddHandoffForm = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledFormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const StyledAddButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

type SettingsAgentHandoffFormProps = {
  agentId: string;
  availableAgentOptions: SelectOption[];
  agentsLoading: boolean;
  onHandoffAdded: () => void;
};

export const SettingsAgentHandoffForm = ({
  agentId,
  availableAgentOptions,
  agentsLoading,
  onHandoffAdded,
}: SettingsAgentHandoffFormProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [isAddingHandoff, setIsAddingHandoff] = useState(false);
  const [selectedTargetAgentId, setSelectedTargetAgentId] = useState('');
  const [handoffDescription, setHandoffDescription] = useState('');

  const [createAgentHandoff] = useCreateAgentHandoffMutation();

  const noAvailableAgents = availableAgentOptions.length === 0;

  const resetHandoffForm = () => {
    setIsAddingHandoff(false);
    setSelectedTargetAgentId('');
    setHandoffDescription('');
  };

  const handleAddHandoff = async () => {
    try {
      await createAgentHandoff({
        variables: {
          input: {
            fromAgentId: agentId,
            toAgentId: selectedTargetAgentId,
            description: handoffDescription,
          },
        },
      });

      onHandoffAdded();
      resetHandoffForm();
      enqueueSuccessSnackBar({
        message: t`Handoff created successfully`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to create handoff`,
      });
    }
  };

  return (
    <>
      {isAddingHandoff ? (
        <StyledAddHandoffForm>
          <Select
            fullWidth
            dropdownId="handoff-target-select"
            label={t`Target Agent`}
            value={selectedTargetAgentId}
            onChange={setSelectedTargetAgentId}
            options={availableAgentOptions}
            emptyOption={{
              label: t`Select a target agent`,
              value: '',
            }}
          />

          <TextArea
            textAreaId="handoff-description-textarea"
            label={t`Description (Optional)`}
            placeholder={t`Describe when this handoff should be used`}
            minRows={2}
            value={handoffDescription}
            onChange={setHandoffDescription}
          />

          <StyledFormActions>
            <Button
              size="small"
              variant="secondary"
              title={t`Cancel`}
              onClick={resetHandoffForm}
            />
            <Button
              accent="blue"
              size="small"
              title={t`Add Handoff`}
              onClick={handleAddHandoff}
              disabled={!selectedTargetAgentId}
            />
          </StyledFormActions>
        </StyledAddHandoffForm>
      ) : (
        <StyledAddButtonContainer>
          <Button
            variant="secondary"
            size="small"
            title={
              agentsLoading
                ? t`Loading...`
                : noAvailableAgents
                  ? t`No agents available for handoff`
                  : t`Add Handoff`
            }
            Icon={IconPlus}
            onClick={() => setIsAddingHandoff(true)}
            disabled={agentsLoading || noAvailableAgents}
          />
        </StyledAddButtonContainer>
      )}
    </>
  );
};
