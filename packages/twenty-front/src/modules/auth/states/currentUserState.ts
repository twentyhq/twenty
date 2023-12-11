import { atom } from 'recoil';

import { User } from '~/generated/graphql';

export type CurrentUser = Pick<
  User,
  'id' | 'email' | 'supportUserHash' | 'canImpersonate'
>;

export const currentUserState = atom<CurrentUser | null>({
  key: 'currentUserState',
  default: null,
});
