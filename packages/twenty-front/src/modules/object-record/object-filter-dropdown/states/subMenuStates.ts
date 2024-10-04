import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { atom } from 'recoil';

export const currentSubMenuState = atom<FilterType | null>({
  key: 'currentSubMenuState',
  default: null,
});

export const currentParentFilterDefinitionState = atom<FilterDefinition | null>(
  {
    key: 'currentParentFilterDefinitionState',
    default: null,
  },
);
