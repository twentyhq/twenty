import { isValidAuthTokenPair } from '@/apollo/utils/isValidAuthTokenPair';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

export const TOKEN_PAIR_LOCAL_STORAGE_KEY = 'tokenPairState';

export const tokenPairState = createAtomState<AuthTokenPair | null>({
  key: TOKEN_PAIR_LOCAL_STORAGE_KEY,
  defaultValue: null,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (payload) => isValidAuthTokenPair(payload),
});
