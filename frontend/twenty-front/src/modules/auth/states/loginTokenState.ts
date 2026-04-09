import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AuthToken } from '~/generated-metadata/graphql';

export const loginTokenState = createAtomState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
