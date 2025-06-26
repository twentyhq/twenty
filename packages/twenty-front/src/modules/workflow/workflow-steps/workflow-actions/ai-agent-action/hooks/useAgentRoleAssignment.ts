import { useRecoilState } from 'recoil';
import {
  useAssignRoleToAgentMutation,
  useFindOneAgentQuery,
  useGetRolesQuery,
  useRemoveRoleFromAgentMutation,
} from '~/generated/graphql';

import { selectedRoleState } from '../states/selectedRoleState';

export const useAgentRoleAssignment = (agentId: string) => {
  const [selectedRole, setSelectedRole] = useRecoilState(selectedRoleState);

  useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      setSelectedRole(data.findOneAgent.roleId);
    },
  });

  const { data: rolesData } = useGetRolesQuery();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [removeRoleFromAgent] = useRemoveRoleFromAgentMutation();

  const handleRoleChange = async (roleId: string) => {
    if (roleId === '') {
      await handleRoleRemove();
    } else {
      setSelectedRole(roleId);
      await assignRoleToAgent({ variables: { input: { agentId, roleId } } });
    }
  };

  const handleRoleRemove = async () => {
    setSelectedRole(undefined);
    await removeRoleFromAgent({ variables: { agentId } });
  };

  const rolesOptions =
    rolesData?.getRoles?.map((role: any) => ({
      label: role.label,
      value: role.id,
    })) || [];

  return {
    selectedRole,
    handleRoleChange,
    rolesOptions,
  };
};
