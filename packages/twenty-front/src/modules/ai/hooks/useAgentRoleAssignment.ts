import { workflowAiAgentSelectedRoleState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentSelectedRoleState';
import { useRecoilState } from 'recoil';
import {
  useAssignRoleToAgentMutation,
  useFindOneAgentQuery,
  useGetRolesQuery,
  useRemoveRoleFromAgentMutation,
} from '~/generated-metadata/graphql';

export const useAgentRoleAssignment = (agentId: string) => {
  const [workflowAiAgentSelectedRole, setWorkflowAiAgentSelectedRole] =
    useRecoilState(workflowAiAgentSelectedRoleState);

  useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      setWorkflowAiAgentSelectedRole(data.findOneAgent.roleId);
    },
  });

  const { data: rolesData } = useGetRolesQuery();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [removeRoleFromAgent] = useRemoveRoleFromAgentMutation();

  const handleRoleChange = async (roleId: string) => {
    if (roleId === '') {
      await handleRoleRemove();
    } else {
      setWorkflowAiAgentSelectedRole(roleId);
      await assignRoleToAgent({ variables: { agentId, roleId } });
    }
  };

  const handleRoleRemove = async () => {
    setWorkflowAiAgentSelectedRole(undefined);
    await removeRoleFromAgent({ variables: { agentId } });
  };

  const rolesOptions =
    rolesData?.getRoles?.map((role) => ({
      label: role.label,
      value: role.id,
    })) || [];

  return {
    selectedRole: workflowAiAgentSelectedRole,
    handleRoleChange,
    rolesOptions,
  };
};
