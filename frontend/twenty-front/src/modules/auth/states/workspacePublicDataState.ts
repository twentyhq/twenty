import { type PublicWorkspaceData } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspacePublicDataState =
  createAtomState<PublicWorkspaceData | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
