import { GRANOLA_API_KEY_HINT_STORAGE_KEY } from 'src/front-components/constants/granola-api-key-hint-storage-key.constant';

export const readStoredGranolaApiKeyHint = (): boolean => {
  try {
    return localStorage.getItem(GRANOLA_API_KEY_HINT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};
