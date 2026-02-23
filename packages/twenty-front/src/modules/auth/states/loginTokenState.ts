import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type AuthToken } from '~/generated-metadata/graphql';

export const loginTokenState = createStateV2<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
