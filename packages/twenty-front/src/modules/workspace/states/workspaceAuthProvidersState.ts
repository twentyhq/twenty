import { type AuthProviders } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspaceAuthProvidersState =
  createAtomState<AuthProviders | null>({
    key: 'workspaceAuthProvidersState',
    defaultValue: null,
  });
