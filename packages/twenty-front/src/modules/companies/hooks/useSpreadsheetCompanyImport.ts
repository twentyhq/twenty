import { Company } from '@/companies/types/Company';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { fieldsForCompany } from '../utils/fieldsForCompany';

export type FieldCompanyMapping = (typeof fieldsForCompany)[number]['key'];

export const useSpreadsheetCompanyImport = () => {
  const { openSpreadsheetImport } = useSpreadsheetImport<FieldCompanyMapping>();
  const { enqueueSnackBar } = useSnackBar();

  const { createManyRecords: createManyCompanies } =
    useCreateManyRecords<Company>({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

  const openCompanySpreadsheetImport = (
    options?: Omit<
      SpreadsheetOptions<FieldCompanyMapping>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImport({
      ...options,
      onSubmit: async (data) => {
        // TODO: Add better type checking in spreadsheet import later
        const createInputs = data.validData.map((company) => ({
          name: company.name as string | undefined,
          domainName: company.domainName as string | undefined,
          ...(company.linkedinUrl
            ? {
                linkedinLink: {
                  label: 'linkedinUrl',
                  url: company.linkedinUrl as string | undefined,
                },
              }
            : {}),
          ...(company.annualRecurringRevenue
            ? {
                annualRecurringRevenue: {
                  amountMicros: Number(company.annualRecurringRevenue),
                  currencyCode: 'USD',
                },
              }
            : {}),
          idealCustomerProfile:
            company.idealCustomerProfile &&
            ['true', true].includes(company.idealCustomerProfile),
          ...(company.xUrl
            ? {
                xLink: {
                  label: 'xUrl',
                  url: company.xUrl as string | undefined,
                },
              }
            : {}),
          address: company.address as string | undefined,
          employees: company.employees ? Number(company.employees) : undefined,
        }));
        // TODO: abstract this part for any object
        try {
          await createManyCompanies(createInputs);
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
