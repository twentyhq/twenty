import { isDefined } from 'twenty-shared/utils';
import { TOKEN_PAIR_LOCAL_STORAGE_KEY } from '@/auth/states/tokenPairState';
import { cookieStorage } from '~/utils/cookie-storage';

const LEGACY_TOKEN_PAIR_COOKIE_KEY = 'tokenPair';

export const migrateTokenPairCookieToLocalStorage = () => {
  try {
    const legacyCookieValue = cookieStorage.getItem(
      LEGACY_TOKEN_PAIR_COOKIE_KEY,
    );

    if (!isDefined(legacyCookieValue)) {
      return;
    }

    const existingLocalStorageValue = localStorage.getItem(
      TOKEN_PAIR_LOCAL_STORAGE_KEY,
    );

    if (!isDefined(existingLocalStorageValue)) {
      localStorage.setItem(TOKEN_PAIR_LOCAL_STORAGE_KEY, legacyCookieValue);
    }

    cookieStorage.removeItem(LEGACY_TOKEN_PAIR_COOKIE_KEY);
  } catch {
    // noop
  }
};
