import { atom, selector } from 'recoil';

import { companyViewFields } from '@/companies/constants/companyViewFields';
import { peopleViewFields } from '@/people/constants/peopleViewFields';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../../editable-field/types/ViewField';

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

export const addableViewFieldDefinitionsState = selector({
  key: 'addableViewFieldDefinitionsState',
  get: ({ get }) => {
    const { objectName, viewFields } = get(viewFieldsState);

    if (!objectName) return [];

    const existingColumnLabels = viewFields.map(
      (viewField) => viewField.columnLabel,
    );
    const viewFieldDefinitions =
      objectName === 'company' ? companyViewFields : peopleViewFields;

    return viewFieldDefinitions.filter(
      (viewFieldDefinition) =>
        !existingColumnLabels.includes(viewFieldDefinition.columnLabel),
    );
  },
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
