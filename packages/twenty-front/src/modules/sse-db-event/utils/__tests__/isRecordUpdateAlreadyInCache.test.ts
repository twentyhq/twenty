import { isRecordUpdateAlreadyInCache } from '@/sse-db-event/utils/isRecordUpdateAlreadyInCache';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const objectMetadataItem = {
  fields: [
    ...personObjectMetadataItem.fields,
    {
      ...personObjectMetadataItem.fields[0],
      name: 'settings',
      type: FieldMetadataType.RAW_JSON,
    },
  ],
};

const cachedRecord = {
  __typename: 'Person',
  id: 'person-1',
  jobTitle: 'Surveyor',
  updatedAt: '2026-09-17T06:00:00.000Z',
  emails: {
    __typename: 'Emails',
    primaryEmail: 'mark@example.com',
    additionalEmails: [],
  },
  updatedBy: {
    __typename: 'Actor',
    source: 'MANUAL',
    name: 'Tim Apple',
    context: { __typename: 'ActorContext', provider: null },
  },
  settings: { enabled: null, __typename: 'custom' },
  companyId: 'company-1',
};

describe('isRecordUpdateAlreadyInCache', () => {
  it('is true when every cached field carried by the event matches, ignoring typenames and null sub-fields', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: {
          id: 'person-1',
          jobTitle: 'Surveyor',
          updatedAt: '2026-09-17T06:00:00.000Z',
          emails: { primaryEmail: 'mark@example.com', additionalEmails: [] },
          updatedBy: { source: 'MANUAL', name: 'Tim Apple', context: {} },
        },
      }),
    ).toBe(true);
  });

  it('ignores event fields the tab never fetched', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: {
          id: 'person-1',
          searchVector: "'mark':1",
          company: { id: 'company-1', name: 'Google' },
          attachments: [],
        },
      }),
    ).toBe(true);
  });

  it('is false when a scalar field differs', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: { id: 'person-1', jobTitle: 'Geologist' },
      }),
    ).toBe(false);
  });

  it('is false when a composite sub-field differs', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: {
          id: 'person-1',
          emails: { primaryEmail: 'other@example.com', additionalEmails: [] },
        },
      }),
    ).toBe(false);
  });

  it('is false when the event carries a newer updatedAt', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: {
          id: 'person-1',
          updatedAt: '2026-09-17T06:00:01.000Z',
        },
      }),
    ).toBe(false);
  });

  it('compares raw JSON values as is, keeping null properties and typename keys', () => {
    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: {
          id: 'person-1',
          settings: { enabled: null, __typename: 'custom' },
        },
      }),
    ).toBe(true);

    expect(
      isRecordUpdateAlreadyInCache({
        cachedRecord,
        objectMetadataItem,
        updatedRecord: { id: 'person-1', settings: {} },
      }),
    ).toBe(false);
  });
});
