import { type AuthProviders } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workspaceAuthProvidersState = createState<AuthProviders | null>({
  key: 'workspaceAuthProvidersState',
  defaultValue: null,
});
