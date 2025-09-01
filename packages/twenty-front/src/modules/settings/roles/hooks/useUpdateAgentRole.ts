import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilState } from 'recoil';
import {
  useAssignRoleToAgentMutation,
  type Agent,
} from '~/generated-metadata/graphql';

type AddAgentToRoleAndUpdateStateParams = {
  agentId: string;
};

type UpdateAgentRoleDraftStateParams = {
  agent: Agent;
};

export const useUpdateAgentRole = (roleId: string) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const [assignRoleToAgentMutation] = useAssignRoleToAgentMutation();

  const updateAgentRoleDraftState = ({
    agent,
  }: UpdateAgentRoleDraftStateParams) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      agents: [
        ...settingsDraftRole.agents,
        {
          id: agent.id,
          name: agent.name,
          label: agent.label,
          description: agent.description,
          icon: agent.icon,
          prompt: agent.prompt,
          modelId: agent.modelId,
          responseFormat: agent.responseFormat,
          roleId: agent.roleId,
          isCustom: agent.isCustom,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        },
      ],
    });
  };

  const addAgentToRoleAndUpdateState = async ({
    agentId,
  }: AddAgentToRoleAndUpdateStateParams) => {
    const { data } = await assignRoleToAgentMutation({
      variables: {
        agentId,
        roleId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ['GetRoles'],
    });

    return data?.assignRoleToAgent;
  };

  return {
    addAgentToRoleAndUpdateState,
    updateAgentRoleDraftState,
  };
};
