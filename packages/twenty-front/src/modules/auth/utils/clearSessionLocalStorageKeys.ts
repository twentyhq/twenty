import { safeRemoveLocalStorageItems } from '@/auth/utils/safeRemoveLocalStorageItems';

const SESSION_KEYS_TO_CLEAR = [
  // Clear values persisted before this now-unused state was removed.
  'lastVisitedObjectMetadataItemIdState',
  'lastVisitedViewPerObjectMetadataItemState',
  'ai/agentChatDraftsByThreadIdState',
  'companyEnrichmentState',
  'personEnrichmentState',
  'locale',
  'currentUserState',
  'currentWorkspaceState',
  'currentWorkspaceMemberState',
  'currentUserWorkspaceState',
];

export const clearSessionLocalStorageKeys = () => {
  safeRemoveLocalStorageItems(SESSION_KEYS_TO_CLEAR);
};
