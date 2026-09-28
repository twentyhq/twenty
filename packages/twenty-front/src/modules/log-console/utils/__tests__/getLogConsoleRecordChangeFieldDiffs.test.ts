import { getLogConsoleRecordChangeFieldDiffs } from '@/log-console/utils/getLogConsoleRecordChangeFieldDiffs';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY = {
  id: 'e0c49b77-894b-449b-9c31-6bfcff73a0e5',
  name: 'Maple Consulting Inc.',
  employees: 2383,
  tagline: '',
  accountOwnerId: '7112c4f4-d9c7-4eaf-b52f-84f2bd9c1b7c',
  position: 3,
};

const EMPTY_PHONES = {
  primaryPhoneNumber: '',
  primaryPhoneCountryCode: '',
  primaryPhoneCallingCode: '',
  additionalPhones: null,
};

const SECONDARY_PHONE = {
  number: '612345678',
  callingCode: '+33',
  countryCode: 'FR',
};

const getFieldDiffs = (
  entry: Pick<EventLogRecord, 'event' | 'properties'>,
  objectNameSingular = 'company',
) =>
  getLogConsoleRecordChangeFieldDiffs({
    entry: { ...entry, timestamp: '2026-09-24T09:42:31.096Z' },
    objectMetadataItem: getMockObjectMetadataItemOrThrow(objectNameSingular),
  }).map(({ key, before, after }) => ({ key, before, after }));

describe('getLogConsoleRecordChangeFieldDiffs', () => {
  it('should keep the changed business fields of an update', () => {
    expect(
      getFieldDiffs({
        event: 'Object Record Updated',
        properties: {
          diff: {
            name: { before: 'Maple', after: 'Maple Consulting Inc.' },
            position: { before: 1, after: 3 },
            tagline: { before: null, after: '' },
            employees: { before: 2380, after: 2383 },
          },
        },
      }),
    ).toEqual([
      { key: 'name', before: 'Maple', after: 'Maple Consulting Inc.' },
      { key: 'employees', before: 2380, after: 2383 },
    ]);
  });

  it('should list the filled fields of a created record except its name', () => {
    expect(
      getFieldDiffs({
        event: 'Object Record Created',
        properties: { after: COMPANY },
      }),
    ).toEqual([
      { key: 'employees', before: undefined, after: 2383 },
      {
        key: 'accountOwnerId',
        before: undefined,
        after: { id: COMPANY.accountOwnerId },
      },
    ]);
  });

  it('should keep a phone change that only adds a secondary number', () => {
    const phonesAfter = {
      ...EMPTY_PHONES,
      additionalPhones: [SECONDARY_PHONE],
    };

    expect(
      getFieldDiffs(
        {
          event: 'Object Record Updated',
          properties: {
            diff: { phones: { before: EMPTY_PHONES, after: phonesAfter } },
          },
        },
        'person',
      ),
    ).toEqual([{ key: 'phones', before: EMPTY_PHONES, after: phonesAfter }]);
  });

  it('should keep secondary phone numbers stored as a JSON string', () => {
    const phonesAfter = {
      ...EMPTY_PHONES,
      additionalPhones: JSON.stringify([SECONDARY_PHONE]),
    };

    expect(
      getFieldDiffs(
        {
          event: 'Object Record Updated',
          properties: {
            diff: { phones: { before: EMPTY_PHONES, after: phonesAfter } },
          },
        },
        'person',
      ),
    ).toEqual([{ key: 'phones', before: EMPTY_PHONES, after: phonesAfter }]);
  });
});
