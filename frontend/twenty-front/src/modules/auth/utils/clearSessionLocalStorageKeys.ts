import { safeRemoveLocalStorageItems } from '@/auth/utils/safeRemoveLocalStorageItems';

const SESSION_KEYS_TO_CLEAR = [
  'lastVisitedObjectMetadataItemIdState',
  'lastVisitedViewPerObjectMetadataItemState',
  'playgroundApiKeyState',
  'ai/agentChatDraftsByThreadIdState',
  'locale',
];

export const clearSessionLocalStorageKeys = () => {
  safeRemoveLocalStorageItems(SESSION_KEYS_TO_CLEAR);
};
