import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';

export type FlatWorkspaceMemberMaps = {
  byId: Partial<Record<string, FlatWorkspaceMember>>;
  idByUserId: Partial<Record<string, string>>;
  idByUserWorkspaceId: Partial<Record<string, string>>;
  userWorkspaceIdByUserId: Partial<Record<string, string>>;
};
