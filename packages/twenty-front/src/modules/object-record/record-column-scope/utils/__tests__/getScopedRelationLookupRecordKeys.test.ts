import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getScopedRelationLookupRecordKeys } from '@/object-record/record-column-scope/utils/getScopedRelationLookupRecordKeys';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});

const emailsLookupTarget = {
  relationFieldName: 'people',
  relationObjectMetadataItem: personObjectMetadataItem,
  lookupTargetFieldMetadataItem: emailsField,
  lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition({
    field: emailsField,
    objectMetadataItem: personObjectMetadataItem,
  }),
};

describe('getScopedRelationLookupRecordKeys', () => {
  it('keeps the response keys of the columns showing a field of their related records', () => {
    expect(
      getScopedRelationLookupRecordKeys([
        { responseKey: 'people_records' },
        { responseKey: 'people_emails', lookupTarget: emailsLookupTarget },
      ]),
    ).toEqual(['people_emails']);
  });
});
