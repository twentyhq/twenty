import { isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type InboxLabelIdentifierField } from '@/sdk/inbox/mentions/types/inbox-label-identifier-field.type';

const getFullNamePart = ({
  fullName,
  partName,
}: {
  fullName: unknown;
  partName: 'firstName' | 'lastName';
}): string => {
  const part = isObject(fullName) ? Reflect.get(fullName, partName) : undefined;

  return isString(part) ? part : '';
};

export const computeInboxRecordLabel = ({
  record,
  recordId,
  labelIdentifierField,
}: {
  record: Record<string, unknown>;
  recordId: string;
  labelIdentifierField: InboxLabelIdentifierField | undefined;
}): string => {
  if (!isDefined(labelIdentifierField)) {
    return recordId;
  }

  const labelValue = record[labelIdentifierField.name];

  if (labelIdentifierField.type === 'FULL_NAME') {
    return `${getFullNamePart({ fullName: labelValue, partName: 'firstName' })} ${getFullNamePart({ fullName: labelValue, partName: 'lastName' })}`.trim();
  }

  return isDefined(labelValue) ? String(labelValue) : '';
};
