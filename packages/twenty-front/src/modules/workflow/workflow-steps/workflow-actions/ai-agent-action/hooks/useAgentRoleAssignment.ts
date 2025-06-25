import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { FIND_ONE_AGENT } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/graphql/queries/findOneAgent';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  useAssignRoleToAgentMutation,
  useRemoveRoleFromAgentMutation,
} from '~/generated/graphql';

export const useAgentRoleAssignment = (agentId: string) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined,
  );

  useQuery(FIND_ONE_AGENT, {
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      setSelectedRoleId(data.findOneAgent.roleId);
    },
  });

  const { data: rolesData } = useQuery(GET_ROLES, {
    onCompleted: (data) => {
      const agentRole = data.getRoles.find((role: any) =>
        role.agentIds?.includes(agentId),
      );
      agentRole && setSelectedRoleId(agentRole.id);
    },
  });
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
