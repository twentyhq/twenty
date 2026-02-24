import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useSetFamilyAtomState } from '@/ui/utilities/state/jotai/hooks/useSetFamilyAtomState';
import {
  useAssignRoleToAgentMutation,
  type Agent,
} from '~/generated-metadata/graphql';

export const useUpdateAgentRole = (roleId: string) => {
  const settingsDraftRole = useFamilyAtomValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetFamilyAtomState(
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
