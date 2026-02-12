import { type PublicWorkspaceDataOutput } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const workspacePublicDataState =
  createState<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
