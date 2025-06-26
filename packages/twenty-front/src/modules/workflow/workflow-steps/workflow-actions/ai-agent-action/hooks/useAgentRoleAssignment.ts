import { useState } from 'react';
import {
  useAssignRoleToAgentMutation,
  useFindOneAgentQuery,
  useGetRolesQuery,
  useRemoveRoleFromAgentMutation,
} from '~/generated/graphql';

export const useAgentRoleAssignment = (agentId: string) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined,
  );

  useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      setSelectedRoleId(data.findOneAgent.roleId);
    },
  });

  const { data: rolesData } = useGetRolesQuery();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [removeRoleFromAgent] = useRemoveRoleFromAgentMutation();

  const handleRoleChange = async (roleId: string) => {
    if (roleId === '') {
      await handleRoleRemove();
    } else {
      setSelectedRoleId(roleId);
      await assignRoleToAgent({ variables: { input: { agentId, roleId } } });
    }
  };

  const handleRoleRemove = async () => {
    setSelectedRoleId(undefined);
    await removeRoleFromAgent({ variables: { agentId } });
  };

  const rolesOptions =
    rolesData?.getRoles?.map((role: any) => ({
      label: role.label,
      value: role.id,
    })) || [];

  return {
    selectedRoleId,
    handleRoleChange,
    rolesOptions,
  };
};
