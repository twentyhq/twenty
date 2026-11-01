import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  AssignRoleToAgentDocument,
  CreateOneRoleDocument,
  DeleteOneRoleDocument,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';

// a step created before steps held their own permissions keeps them on its hidden agent's role until it is migrated
export const useCreateWorkflowStepOwnedAgentRole = ({
  stepId,
}: {
  stepId: string;
}) => {
  const { t } = useLingui();
  const { getUpdatableWorkflowVersionStepOrThrow } =
    useGetUpdatableWorkflowVersionOrThrow();
  const setWorkflowAiAgentActionAgent = useSetAtomState(
    workflowAiAgentActionAgentState,
  );
  const [createRole] = useMutation(CreateOneRoleDocument);
  const [assignRoleToAgent] = useMutation(AssignRoleToAgentDocument);
  const [deleteRole] = useMutation(DeleteOneRoleDocument);
  const apolloClient = useApolloClient();

  const createWorkflowStepOwnedAgentRole = async ({
    agentLabel,
  }: {
    agentLabel: string;
  }): Promise<string> => {
    const updatableStep = await getUpdatableWorkflowVersionStepOrThrow({
      stepId,
      stepType: 'AI_AGENT',
    });

    const updatableAgentId = updatableStep.settings.input.agentId;

    if (!isDefined(updatableAgentId)) {
      throw new CustomError(
        doNotTranslate('The AI agent step has no agent'),
        'AI_AGENT_STEP_HAS_NO_AGENT',
      );
    }

    const roleId = v4();
    const agentIdPrefix = updatableAgentId.substring(0, 8);

    await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: t`${agentLabel} role (${agentIdPrefix})`,
          description: t`Auto-generated role for ${agentLabel}`,
          icon: 'IconLego',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToAgents: true,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
        },
      },
    });

    try {
      await assignRoleToAgent({
        variables: { agentId: updatableAgentId, roleId },
        refetchQueries: ['FindOneAgent'],
      });
    } catch (assignmentError) {
      // the assignment may have committed before the request failed, and deleting an assigned role moves its agent to the workspace default role
      const { data } = await apolloClient.query({
        query: FindOneAgentDocument,
        variables: { id: updatableAgentId },
        fetchPolicy: 'network-only',
      });

      if (data?.findOneAgent.roleId !== roleId) {
        await deleteRole({ variables: { roleId } });

        throw assignmentError;
      }
    }

    setWorkflowAiAgentActionAgent((currentAgent) =>
      currentAgent?.id === updatableAgentId
        ? { ...currentAgent, roleId }
        : currentAgent,
    );

    return roleId;
  };

  return { createWorkflowStepOwnedAgentRole };
};
