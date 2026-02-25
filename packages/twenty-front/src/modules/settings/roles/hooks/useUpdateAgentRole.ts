import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  useAssignRoleToAgentMutation,
  type Agent,
} from '~/generated-metadata/graphql';

export const useUpdateAgentRole = (roleId: string) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
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

  const addAgentsToRole = async ({
    roleId,
    agentIds,
  }: {
    roleId: string;
    agentIds: string[];
  }) => {
    await Promise.all(
      agentIds.map((agentId) =>
        assignRoleToAgentMutation({
          variables: {
            roleId,
            agentId,
          },
        }),
      ),
    );
  };

  return {
    addAgentToRoleAndUpdateState,
    updateAgentRoleDraftState,
    addAgentsToRole,
  };
};
