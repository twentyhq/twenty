import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { atom } from 'recoil';

export const currentSubMenuState = atom<FilterableFieldType | null>({
  key: 'currentSubMenuState',
  default: null,
});

export const currentParentFilterDefinitionState = atom<FilterDefinition | null>(
  {
    key: 'currentParentFilterDefinitionState',
    default: null,
  },
);
