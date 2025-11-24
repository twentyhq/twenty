import { type CountryCode } from 'libphonenumber-js';
import uniqBy from 'lodash.uniqby';
import {
  type AdditionalPhoneMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

export const mergePhonesFieldValues = (
  recordsWithValues: { value: PhonesMetadata; recordId: string }[],
  priorityRecordId: string,
): PhonesMetadata => {
  if (recordsWithValues.length === 0) {
    return {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '',
      additionalPhones: null,
    };
  }

  let primaryPhoneNumber = '';
  let primaryPhoneCountryCode: CountryCode | null = null;
  let primaryPhoneCallingCode = '';

  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (
    priorityRecord &&
    hasRecordFieldValue(priorityRecord.value.primaryPhoneNumber)
  ) {
    primaryPhoneNumber = priorityRecord.value.primaryPhoneNumber;
    primaryPhoneCountryCode = priorityRecord.value.primaryPhoneCountryCode;
    primaryPhoneCallingCode = priorityRecord.value.primaryPhoneCallingCode;
  } else {
    const fallbackRecord = recordsWithValues.find((record) =>
      hasRecordFieldValue(record.value.primaryPhoneNumber),
    );

    if (fallbackRecord) {
      primaryPhoneNumber = fallbackRecord.value.primaryPhoneNumber;
      primaryPhoneCountryCode = fallbackRecord.value.primaryPhoneCountryCode;
      primaryPhoneCallingCode = fallbackRecord.value.primaryPhoneCallingCode;
    }
  }

  const allPhones: AdditionalPhoneMetadata[] = [];

  recordsWithValues.forEach((record) => {
    if (hasRecordFieldValue(record.value.primaryPhoneNumber)) {
      allPhones.push({
        number: record.value.primaryPhoneNumber,
        countryCode: record.value.primaryPhoneCountryCode,
        callingCode: record.value.primaryPhoneCallingCode,
      });
    }

    if (Array.isArray(record.value.additionalPhones)) {
      allPhones.push(
        ...record.value.additionalPhones.filter((phone) =>
          hasRecordFieldValue(phone.number),
        ),
      );
    }
  });

  const uniquePhones = uniqBy(allPhones, 'number').filter(
    (phone) => phone.number !== primaryPhoneNumber,
  );

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode: primaryPhoneCountryCode!,
    primaryPhoneCallingCode,
    additionalPhones: uniquePhones.length > 0 ? uniquePhones : null,
  };
};
