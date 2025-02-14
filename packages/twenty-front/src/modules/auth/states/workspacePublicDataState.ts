import { createState } from '@ui/utilities/state/utils/createState';
import { PublicWorkspaceDataOutput } from '~/generated/graphql';

export const workspacePublicDataState =
  createState<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
