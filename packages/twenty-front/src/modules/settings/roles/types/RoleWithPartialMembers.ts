import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { type Role, type WorkspaceMember } from '~/generated-metadata/graphql';

export type PartialWorkspaceMember = Omit<
  WorkspaceMember,
  | 'colorScheme'
  | 'uiScale'
  | 'openRecordIn'
  | 'locale'
  | 'timeZone'
  | 'dateFormat'
  | 'timeFormat'
  | 'calendarStartDay'
  | 'createdAt'
  | 'updatedAt'
>;

export type RoleWithPartialMembers = Omit<
  Role,
  'workspaceMembers' | 'agents'
> & {
  workspaceMembers: PartialWorkspaceMember[];
  agents: FlatAgent[];
};
