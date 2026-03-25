import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldInputInstanceId = ({
  recordId,
  fieldName,
  prefix,
}: {
  recordId: string;
  fieldName?: string;
  prefix?: string;
}): string => {
  if (isDefined(prefix)) {
    return `${prefix}-${recordId}-${fieldName}`;
  }

  return `${recordId}-${fieldName}`;
};
