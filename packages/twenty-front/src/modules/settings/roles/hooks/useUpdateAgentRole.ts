import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilState } from 'recoil';
import {
  useAssignRoleToAgentMutation,
  type Agent,
} from '~/generated-metadata/graphql';

export const useUpdateAgentRole = (roleId: string) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const [assignRoleToAgentMutation] = useAssignRoleToAgentMutation();

  const updateAgentRoleDraftState = ({ agent }: { agent: Agent }) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      agents: [...settingsDraftRole.agents, agent],
    });
  };

  const addAgentToRoleAndUpdateState = async ({
    agentId,
  }: {
    agentId: string;
  }) => {
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
