import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type AuthToken } from '~/generated-metadata/graphql';

export const loginTokenState = createState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
