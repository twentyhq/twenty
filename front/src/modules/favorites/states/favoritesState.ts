import { atom } from 'recoil';

import { Company, Favorite, Person } from '~/generated/graphql';

export const favoritesState = atom<
  Array<
    Pick<Favorite, 'id' | 'position'> & {
      company?: Pick<Company, 'id' | 'name' | 'domainName'>;
    } & {
      person?: Pick<Person, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
    }
  >
>({
  key: 'favoritesState',
  default: [],
});
