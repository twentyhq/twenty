import { atom, selector } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const tableColumnsState = atom<ViewFieldDefinition<ViewFieldMetadata>[]>(
  {
    key: 'tableColumnsState',
    default: [],
  },
);

export const tableColumnsByIdState = selector({
  key: 'tableColumnsByIdState',
  get: ({ get }) =>
    get(tableColumnsState).reduce<
      Record<string, ViewFieldDefinition<ViewFieldMetadata>>
    >((result, column) => ({ ...result, [column.id]: column }), {}),
});

export const numberOfTableColumnsState = selector<number>({
  key: 'numberOfTableColumnsState',
  get: ({ get }) => get(tableColumnsState).length,
});

export const visibleTableColumnsState = selector({
  key: 'visibleTableColumnsState',
  get: ({ get }) => get(tableColumnsState).filter((column) => column.isVisible),
});

export const hiddenTableColumnsState = selector({
  key: 'hiddenTableColumnsState',
  get: ({ get }) =>
    get(tableColumnsState).filter((column) => !column.isVisible),
});
