import { atom } from 'recoil';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsDraftState = atom<NavigationMenuItem[] | null>({
  key: 'navigationMenuItemsDraftState',
  default: null,
});
