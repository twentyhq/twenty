import { isLookupTargetFieldReadable } from '@/object-record/record-column-lookup/utils/isLookupTargetFieldReadable';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});

describe('isLookupTargetFieldReadable', () => {
  it('is readable when the related object lists the field as readable', () => {
    expect(
      isLookupTargetFieldReadable({
        relationObjectMetadataItem: {
          ...personObjectMetadataItem,
          readableFields: [emailsField],
        },
        lookupTargetFieldMetadataItem: emailsField,
      }),
    ).toBe(true);
  });

  it('is not readable when a permission hides the field', () => {
    expect(
      isLookupTargetFieldReadable({
        relationObjectMetadataItem: {
          ...personObjectMetadataItem,
          readableFields: [],
        },
        lookupTargetFieldMetadataItem: emailsField,
      }),
    ).toBe(false);
  });
});
