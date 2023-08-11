import { atom, selector } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export const viewFieldsState = atom<{
  objectName: 'company' | 'person' | '';
  viewFields: ViewFieldDefinition<ViewFieldMetadata>[];
}>({
  key: 'viewFieldsState',
  default: { objectName: '', viewFields: [] },
});

export const columnWidthByViewFieldIdState = selector({
  key: 'columnWidthByViewFieldIdState',
  get: ({ get }) =>
    get(viewFieldsState).viewFields.reduce<Record<string, number>>(
      (result, viewField) => ({
        ...result,
        [viewField.id]: viewField.columnSize,
      }),
      {},
    ),
});

export const visibleViewFieldsState = selector({
  key: 'visibleViewFieldsState',
  get: ({ get }) =>
    get(viewFieldsState).viewFields.filter((viewField) => viewField.isVisible),
});

export const hiddenViewFieldsState = selector({
  key: 'hiddenViewFieldsState',
  get: ({ get }) =>
    get(viewFieldsState).viewFields.filter((viewField) => !viewField.isVisible),
});
