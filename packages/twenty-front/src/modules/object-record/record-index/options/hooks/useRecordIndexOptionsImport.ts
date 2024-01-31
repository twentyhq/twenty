import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';

type useRecordIndexOptionsImportParams = {
  objectNameSingular: string;
};

export const useRecordIndexOptionsImport = ({
  objectNameSingular,
}: useRecordIndexOptionsImportParams) => {
  const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();
  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const handleImport =
    CoreObjectNameSingular.Company === objectNameSingular
      ? openCompanySpreadsheetImport
      : CoreObjectNameSingular.Person === objectNameSingular
        ? openPersonSpreadsheetImport
        : undefined;

  return { handleImport };
};
