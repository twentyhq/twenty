import { type CoreAgentAvatarPatch } from '@/object-core/agents/types/CoreAgentAvatarPatch';

export type CoreAgentAvatarPendingUpdate = {
  id: string;
  patch: CoreAgentAvatarPatch;
};
