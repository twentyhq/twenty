import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export type InboxMessageAuthor<
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  > = PartialWorkspaceMember,
> = {
  name: string;
  // false while the name is a placeholder: a member who left, or an agent not loaded yet
  isNameResolved: boolean;
} & (
  | { type: 'builtInAssistant' }
  | { type: 'application'; applicationId: string }
  | { type: 'agent'; agentId: string }
  | {
      type: 'member';
      senderWorkspaceMemberId: string;
      sender: TWorkspaceMember | undefined;
    }
  | { type: 'unknown'; messageId: string }
);
