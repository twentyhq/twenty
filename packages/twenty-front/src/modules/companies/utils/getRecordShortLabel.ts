import { COMPANY_SHORT_NAME_FIELD_NAME } from '@/companies/constants/CompanyShortNameFieldName';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getRecordShortLabel = ({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: ObjectRecord;
}): string | undefined => {
  if (objectNameSingular !== CoreObjectNameSingular.Company) {
    return undefined;
  }

  const shortName = record[COMPANY_SHORT_NAME_FIELD_NAME];
  const trimmedShortName = isString(shortName) ? shortName.trim() : '';

  return isNonEmptyString(trimmedShortName) ? trimmedShortName : undefined;
};
