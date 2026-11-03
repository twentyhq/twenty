import { type AgentAvatarColor, type AgentAvatarShape } from 'twenty-shared/ai';

export type CoreAgentAvatarPatch =
  | { avatarColor: AgentAvatarColor | null; avatarShape?: never }
  | { avatarShape: AgentAvatarShape | null; avatarColor?: never };
