import { v4 as uuidv4 } from 'uuid';

import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { useInsertManyCompanyMutation } from '~/generated/graphql';

import { fieldsForCompany } from '../utils/fieldsForCompany';

export type FieldCompanyMapping = (typeof fieldsForCompany)[number]['key'];

export const useSpreadsheetCompanyImport = () => {
  const { openSpreadsheetImport } = useSpreadsheetImport<FieldCompanyMapping>();
  const { enqueueSnackBar } = useSnackBar();

  const [createManyCompany] = useInsertManyCompanyMutation();

  const openCompanySpreadsheetImport = (
    options?: Omit<
      SpreadsheetOptions<FieldCompanyMapping>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImport({
      ...options,
      async onSubmit(data) {
        // TODO: Add better type checking in spreadsheet import later
        const createInputs = data.validData.map((company) => ({
          id: uuidv4(),
          name: (company.name ?? '') as string,
          domainName: (company.domainName ?? '') as string,
          address: (company.address ?? '') as string,
          employees: parseInt((company.employees ?? '') as string, 10),
          linkedinUrl: (company.linkedinUrl ?? '') as string | undefined,
        }));

        try {
          const result = await createManyCompany({
            variables: {
              data: createInputs,
            },
            refetchQueries: 'active',
          });

          if (result.errors) {
            throw result.errors;
          }
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: 'error',
          });
        }
      },
      fields: fieldsForCompany,
    });
  };

  return { openCompanySpreadsheetImport };
};
