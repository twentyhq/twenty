import { atom } from 'recoil';

import { ColorScheme } from '~/generated-metadata/graphql';

export type CurrentWorkspaceMember = {
  id: string;
  locale: string;
  colorScheme: ColorScheme;
  allowImpersonation: boolean;
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

export const currentWorkspaceMemberState = atom<CurrentWorkspaceMember | null>({
  key: 'currentWorkspaceMemberState',
  default: null,
});
