import { v4 } from 'uuid';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { Person } from '@/people/types/Person';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { fieldsForPerson } from '../utils/fieldsForPerson';

export type FieldPersonMapping = (typeof fieldsForPerson)[number]['key'];

export const useSpreadsheetPersonImport = () => {
  const { openSpreadsheetImport } = useSpreadsheetImport<FieldPersonMapping>();
  const { enqueueSnackBar } = useSnackBar();

  const { createManyRecords: createManyPeople } = useCreateManyRecords<Person>({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const openPersonSpreadsheetImport = (
    options?: Omit<
      SpreadsheetOptions<FieldPersonMapping>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImport({
      ...options,
      onSubmit: async (data) => {
        // TODO: Add better type checking in spreadsheet import later
        const createInputs = data.validData.map((person) => ({
          id: v4(),
          name: {
            firstName: person.firstName as string | undefined,
            lastName: person.lastName as string | undefined,
          },
          email: person.email as string | undefined,
          ...(person.linkedinUrl
            ? {
                linkedinLink: {
                  label: 'linkedinUrl',
                  url: person.linkedinUrl as string | undefined,
                },
              }
            : {}),
          ...(person.xUrl
            ? {
                xLink: {
                  label: 'xUrl',
                  url: person.xUrl as string | undefined,
                },
              }
            : {}),
          jobTitle: person.jobTitle as string | undefined,
          phone: person.phone as string | undefined,
          city: person.city as string | undefined,
        }));
        // TODO: abstract this part for any object
        try {
          await createManyPeople(createInputs);
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: 'error',
          });
        }
      },
      fields: fieldsForPerson,
    });
  };

  return { openPersonSpreadsheetImport };
};
