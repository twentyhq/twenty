import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { type RoleMaps } from '@/settings/roles/role-assignment/types/role-maps';

export const buildRoleMaps = (roles: RoleWithPartialMembers[]): RoleMaps => {
  const maps: RoleMaps = {
    member: new Map(),
    agent: new Map(),
    apiKey: new Map(),
  };

  roles.forEach((role) => {
    role.workspaceMembers.forEach((member) => {
      maps.member.set(member.id, { id: role.id, label: role.label });
    });
    role.agents?.forEach((agent) => {
      maps.agent.set(agent.id, { id: role.id, label: role.label });
    });
    role.apiKeys?.forEach((apiKey) => {
      maps.apiKey.set(apiKey.id, { id: role.id, label: role.label });
    });
  });

  return maps;
};
