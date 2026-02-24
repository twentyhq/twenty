import { type AuthProviders } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workspaceAuthProvidersState = createStateV2<AuthProviders | null>({
  key: 'workspaceAuthProvidersState',
  defaultValue: null,
});
