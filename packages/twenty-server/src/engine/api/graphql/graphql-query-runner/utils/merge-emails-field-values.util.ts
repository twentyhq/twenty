import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';
import { type EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';

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

  const allAdditionalEmails: string[] = [];

  recordsWithValues.forEach((record) => {
    const additionalEmails = parseArrayOrJsonStringToArray<string>(
      record.value.additionalEmails,
    );

    allAdditionalEmails.push(
      ...additionalEmails.filter((email) => hasRecordFieldValue(email)),
    );
  });

  const uniqueAdditionalEmails = Array.from(new Set(allAdditionalEmails));

  return {
    primaryEmail,
    additionalEmails:
      uniqueAdditionalEmails.length > 0 ? uniqueAdditionalEmails : null,
  };
};
