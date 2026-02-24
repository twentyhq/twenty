import { type AuthBypassProviders } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workspaceAuthBypassProvidersState =
  createStateV2<AuthBypassProviders | null>({
    key: 'workspaceAuthBypassProvidersState',
    defaultValue: null,
  });
