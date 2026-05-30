import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AuthToken } from '~/generated-metadata/graphql';

export const playgroundApiKeyState = createAtomState<AuthToken | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
  useLocalStorage: true,
});
