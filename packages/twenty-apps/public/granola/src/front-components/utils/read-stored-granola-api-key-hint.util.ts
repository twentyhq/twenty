import { GRANOLA_API_KEY_HINT_STORAGE_KEY } from 'src/front-components/constants/granola-api-key-hint-storage-key.constant';

// Secrets never reach the component, so the last known state picks the loading skeleton.
export const readStoredGranolaApiKeyHint = (): boolean => {
  try {
    return localStorage.getItem(GRANOLA_API_KEY_HINT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};
