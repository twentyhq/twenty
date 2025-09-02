import { type CountryCode } from 'libphonenumber-js';
import uniqBy from 'lodash.uniqby';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import {
  type AdditionalPhoneMetadata,
  type PhonesMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';

export const mergePhonesFieldValues = (
  recordsWithValues: { value: PhonesMetadata; recordId: string }[],
  priorityRecordId: string,
): PhonesMetadata | null => {
  if (recordsWithValues.length === 0) {
    return null;
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

  const allAdditionalPhones: AdditionalPhoneMetadata[] = [];

  recordsWithValues.forEach((record) => {
    if (Array.isArray(record.value.additionalPhones)) {
      allAdditionalPhones.push(
        ...record.value.additionalPhones.filter((phone) =>
          hasRecordFieldValue(phone.number),
        ),
      );
    }
  });

  const uniqueAdditionalPhones = uniqBy(allAdditionalPhones, 'number');

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode: primaryPhoneCountryCode!,
    primaryPhoneCallingCode,
    additionalPhones:
      uniqueAdditionalPhones.length > 0 ? uniqueAdditionalPhones : null,
  };
};
