import { type EmailsMetadata } from 'twenty-shared/types';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';

export const mergeEmailsFieldValues = (
  recordsWithValues: { value: EmailsMetadata; recordId: string }[],
  priorityRecordId: string,
): EmailsMetadata => {
  if (recordsWithValues.length === 0) {
    return {
      primaryEmail: '',
      additionalEmails: null,
    };
  }

  let primaryEmail = '';
  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (
    priorityRecord &&
    hasRecordFieldValue(priorityRecord.value.primaryEmail)
  ) {
    primaryEmail = priorityRecord.value.primaryEmail;
  } else {
    const fallbackRecord = recordsWithValues.find((record) =>
      hasRecordFieldValue(record.value.primaryEmail),
    );

    primaryEmail = fallbackRecord?.value.primaryEmail || '';
  }

  const allEmails: string[] = [];

  recordsWithValues.forEach((record) => {
    if (hasRecordFieldValue(record.value.primaryEmail)) {
      allEmails.push(record.value.primaryEmail);
    }

    const additionalEmails = parseArrayOrJsonStringToArray<string>(
      record.value.additionalEmails,
    );

    allEmails.push(
      ...additionalEmails.filter((email) => hasRecordFieldValue(email)),
    );
  });

  const uniqueEmails = Array.from(new Set(allEmails)).filter(
    (email) => email !== primaryEmail,
  );

  return {
    primaryEmail,
    additionalEmails: uniqueEmails.length > 0 ? uniqueEmails : null,
  };
};
