import { GRANOLA_API_KEY_HINT_STORAGE_KEY } from 'src/front-components/constants/granola-api-key-hint-storage-key.constant';

export const storeGranolaApiKeyHint = (isApiKeySet: boolean): void => {
  try {
    localStorage.setItem(
      GRANOLA_API_KEY_HINT_STORAGE_KEY,
      isApiKeySet ? 'true' : 'false',
    );
  } catch {
    return;
  }
};
