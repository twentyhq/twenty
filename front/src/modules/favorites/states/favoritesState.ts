import { atom } from 'recoil';

import { Favorite } from '@/favorites/types/Favorite';
import { Company, Person } from '~/generated/graphql';

export const favoritesState = atom<
  Array<
    Favorite & {
      company?: Pick<Company, 'id' | 'name' | 'domainName'>;
    } & {
      person?: Pick<Person, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
    }
  >
>({
  key: 'favoritesState',
  default: [],
});
