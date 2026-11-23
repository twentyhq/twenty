import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getRelatedRecordsWithLookupValue } from '@/object-record/record-column-scope/utils/getRelatedRecordsWithLookupValue';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const getLookupTargetFieldDefinition = (fieldName: string) =>
  formatFieldMetadataItemAsFieldDefinition({
    field: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: personObjectMetadataItem,
      fieldName,
    }),
    objectMetadataItem: personObjectMetadataItem,
  });

const getPerson = ({
  id,
  ...fieldValues
}: {
  id: string;
  jobTitle?: string | null;
  emails?: { primaryEmail: string; additionalEmails: string[] };
}) => ({ id, __typename: 'Person', ...fieldValues });

describe('getRelatedRecordsWithLookupValue', () => {
  it('keeps, in order, the related records that have a value', () => {
    const engineer = getPerson({ id: 'person-1', jobTitle: 'Engineer' });
    const designer = getPerson({ id: 'person-4', jobTitle: 'Designer' });

    expect(
      getRelatedRecordsWithLookupValue({
        relatedRecords: [
          engineer,
          getPerson({ id: 'person-2', jobTitle: '' }),
          getPerson({ id: 'person-3', jobTitle: null }),
          null,
          designer,
        ],
        lookupTargetFieldDefinition: getLookupTargetFieldDefinition('jobTitle'),
      }),
    ).toEqual([engineer, designer]);
  });

  it('reads a composite value as empty when its main sub-field is', () => {
    const personWithEmail = getPerson({
      id: 'person-1',
      emails: { primaryEmail: 'ada@acme.com', additionalEmails: [] },
    });

    expect(
      getRelatedRecordsWithLookupValue({
        relatedRecords: [
          personWithEmail,
          getPerson({
            id: 'person-2',
            emails: { primaryEmail: '', additionalEmails: [] },
          }),
          getPerson({ id: 'person-3' }),
        ],
        lookupTargetFieldDefinition: getLookupTargetFieldDefinition('emails'),
      }),
    ).toEqual([personWithEmail]);
  });
});
