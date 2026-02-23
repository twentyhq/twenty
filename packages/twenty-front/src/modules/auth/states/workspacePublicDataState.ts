import { type PublicWorkspaceDataOutput } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const workspacePublicDataState =
  createStateV2<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
