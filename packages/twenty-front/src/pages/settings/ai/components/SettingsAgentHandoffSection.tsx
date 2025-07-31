import { useLingui } from '@lingui/react/macro';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { useState } from 'react';
import { H2Title, IconPlus, IconTrash } from 'twenty-ui/display';
import { Button, SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  useCreateAgentHandoffMutation,
  useFindAgentHandoffTargetsQuery,
  useFindManyAgentsQuery,
  useRemoveAgentHandoffMutation,
} from '~/generated-metadata/graphql';

const StyledHandoffContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHandoffItem = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledHandoffInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledHandoffLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledHandoffDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledAddHandoffForm = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

export const SettingsAgentHandoffSection = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [isAddingHandoff, setIsAddingHandoff] = useState(false);
  const [selectedToAgentId, setSelectedToAgentId] = useState('');
  const [handoffDescription, setHandoffDescription] = useState('');

  const { data: agentsData } = useFindManyAgentsQuery();
  const { data: handoffTargetsData, refetch: refetchHandoffTargets } =
    useFindAgentHandoffTargetsQuery({
      variables: { input: { id: agentId } },
      skip: !agentId,
    });

  const [createAgentHandoff] = useCreateAgentHandoffMutation();
  const [removeAgentHandoff] = useRemoveAgentHandoffMutation();

  const availableAgentOptions =
    agentsData?.findManyAgents?.reduce<SelectOption[]>((acc, agent) => {
      if (
        agent.id !== agentId &&
        !handoffTargets.some((target) => target.id === agent.id)
      ) {
        acc.push({
          label: agent.label,
          value: agent.id,
        });
      }
      return acc;
    }, []) || [];

  const handoffTargets = handoffTargetsData?.findAgentHandoffTargets || [];

  const resetHandoffForm = () => {
    setIsAddingHandoff(false);
    setSelectedToAgentId('');
    setHandoffDescription('');
  };

  const handleAddHandoff = async () => {
    try {
      await createAgentHandoff({
        variables: {
          input: {
            fromAgentId: agentId,
            toAgentId: selectedToAgentId,
            description: handoffDescription,
          },
        },
      });

      await refetchHandoffTargets();
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

  const handleRemoveHandoff = async (toAgentId: string) => {
    try {
      await removeAgentHandoff({
        variables: {
          input: {
            fromAgentId: agentId,
            toAgentId,
          },
        },
      });

      await refetchHandoffTargets();
      enqueueSuccessSnackBar({
        message: t`Handoff removed successfully`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to remove handoff`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Agent Handoffs`}
        description={t`Configure which agents this agent can hand off conversations to`}
      />

      <StyledHandoffContainer>
        {handoffTargets.map((targetAgent) => (
          <StyledHandoffItem key={targetAgent.id}>
            <StyledHandoffInfo>
              <StyledHandoffLabel>{targetAgent.label}</StyledHandoffLabel>
              {targetAgent.description && (
                <StyledHandoffDescription>
                  {targetAgent.description}
                </StyledHandoffDescription>
              )}
            </StyledHandoffInfo>
            <Button
              accent="danger"
              variant="secondary"
              title={t`Remove Handoff`}
              Icon={IconTrash}
              onClick={() => handleRemoveHandoff(targetAgent.id)}
            />
          </StyledHandoffItem>
        ))}

        {isAddingHandoff ? (
          <StyledAddHandoffForm>
            <Select
              fullWidth
              dropdownId="handoff-target-select"
              label={t`Target Agent`}
              value={selectedToAgentId}
              onChange={setSelectedToAgentId}
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
                disabled={!selectedToAgentId}
              />
            </StyledFormActions>
          </StyledAddHandoffForm>
        ) : (
          <Button
            variant="secondary"
            size="small"
            title={t`Add Handoff`}
            Icon={IconPlus}
            onClick={() => setIsAddingHandoff(true)}
          />
        )}
      </StyledHandoffContainer>
    </Section>
  );
};
