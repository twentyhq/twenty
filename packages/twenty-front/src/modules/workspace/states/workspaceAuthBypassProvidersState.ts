import { type AuthBypassProviders } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const workspaceAuthBypassProvidersState =
  createState<AuthBypassProviders | null>({
    key: 'workspaceAuthBypassProvidersState',
    defaultValue: null,
  });
