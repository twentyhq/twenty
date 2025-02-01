import { createState } from "twenty-shared";
import { PublicWorkspaceDataOutput } from '~/generated/graphql';

export const workspacePublicDataState =
  createState<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
