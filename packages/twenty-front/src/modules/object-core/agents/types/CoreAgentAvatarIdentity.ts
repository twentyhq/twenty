import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';

export type CoreAgentAvatarIdentity = Pick<CoreAgent, 'id'> &
  Partial<Pick<CoreAgent, 'icon' | 'avatarColor' | 'avatarShape'>>;
