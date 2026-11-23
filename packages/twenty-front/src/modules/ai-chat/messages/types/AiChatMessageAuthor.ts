import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export type AiChatMessageAuthor<
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  > = PartialWorkspaceMember,
> = {
  name: string;
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
