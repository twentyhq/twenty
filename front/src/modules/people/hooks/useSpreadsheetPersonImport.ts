import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';

import { fieldsForPerson } from '../utils/fieldsForPerson';

export type FieldPersonMapping = (typeof fieldsForPerson)[number]['key'];

export const useSpreadsheetPersonImport = () => {
  const { openSpreadsheetImport } = useSpreadsheetImport<FieldPersonMapping>();

  const openPersonSpreadsheetImport = (
    options?: Omit<
      SpreadsheetOptions<FieldPersonMapping>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImport({
      ...options,
      onSubmit: async (_data) => {
        // TODO: Add better type checking in spreadsheet import later
        // const createInputs = data.validData.map((person) => ({
        //   id: uuidv4(),
        //   firstName: person.firstName as string | undefined,
        //   lastName: person.lastName as string | undefined,
        //   email: person.email as string | undefined,
        //   linkedinUrl: person.linkedinUrl as string | undefined,
        //   xUrl: person.xUrl as string | undefined,
        //   jobTitle: person.jobTitle as string | undefined,
        //   phone: person.phone as string | undefined,
        //   city: person.city as string | undefined,
        // }));
        // TODO : abstract this part for any object
        // try {
        //   const result = await createManyPerson({
        //     variables: {
        //       data: createInputs,
        //     },
        //     refetchQueries: 'active',
        //   });
        //   if (result.errors) {
        //     throw result.errors;
        //   }
        // } catch (error: any) {
        //   enqueueSnackBar(error?.message || 'Something went wrong', {
        //     variant: 'error',
        //   });
        // }
      },
      fields: fieldsForPerson,
    });
  };

  return { openPersonSpreadsheetImport };
};
