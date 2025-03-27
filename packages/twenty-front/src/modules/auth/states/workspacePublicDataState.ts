import { createState } from 'twenty-ui';
import { PublicWorkspaceDataOutput } from '~/generated/graphql';

export const workspacePublicDataState =
  createState<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
