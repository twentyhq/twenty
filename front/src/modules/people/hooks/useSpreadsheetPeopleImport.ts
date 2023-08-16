import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { RsiProps } from '@/spreadsheet-import/types';
import {
  useInsertManyCompanyMutation,
  useInsertManyPersonMutation,
} from '~/generated/graphql';

import { fieldsForPerson } from '../utils/fieldsForPerson';

export type EntityMutationMap = {
  Person: typeof useInsertManyPersonMutation;
  Company: typeof useInsertManyCompanyMutation;
};

export type EntityName = keyof EntityMutationMap;

export type FieldMapping = (typeof fieldsForPerson)[number]['key'];

export function useSpreadsheetPeopleImport() {
  const { openSpreadsheetImport } = useSpreadsheetImport<FieldMapping>();

  const [createManyPerson] = useInsertManyPersonMutation();

  const openEntitySpreadsheetImport = (
    options?: Omit<RsiProps<FieldMapping>, 'fields' | 'isOpen' | 'onClose'>,
  ) => {
    openSpreadsheetImport({
      ...options,
      async onSubmit(data) {
        await createManyPerson({
          variables: {
            data: data.validData,
          },
        });
      },
      fields: fieldsForPerson,
    });
  };

  return { openEntitySpreadsheetImport };
}
