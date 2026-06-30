import { safeRemoveLocalStorageItems } from '@/auth/utils/safeRemoveLocalStorageItems';

const SESSION_KEYS_TO_CLEAR = [
  'lastVisitedObjectMetadataItemIdState',
  'lastVisitedViewPerObjectMetadataItemState',
  'ai/agentChatDraftsByThreadIdState',
  'locale',
  'currentUserState',
  'currentWorkspaceState',
  'currentWorkspaceMemberState',
  'currentUserWorkspaceState',
];

export const clearSessionLocalStorageKeys = () => {
  safeRemoveLocalStorageItems(SESSION_KEYS_TO_CLEAR);
};
