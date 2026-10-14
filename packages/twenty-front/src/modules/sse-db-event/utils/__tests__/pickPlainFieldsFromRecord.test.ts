import { pickPlainFieldsFromRecord } from '@/sse-db-event/utils/pickPlainFieldsFromRecord';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('pickPlainFieldsFromRecord', () => {
  it('should keep plain fields and drop relations, join columns and unknown keys', () => {
    const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

    expect(
      pickPlainFieldsFromRecord({
        objectMetadataItem: personObjectMetadataItem,
        record: {
          id: 'person-1',
          updatedAt: '2026-10-13T10:00:02.000Z',
          jobTitle: 'CEO',
          name: { firstName: 'Tim', lastName: 'Apple' },
          companyId: 'company-1',
          company: { id: 'company-1' },
          unknownField: 'value',
        },
      }),
    ).toEqual({
      id: 'person-1',
      updatedAt: '2026-10-13T10:00:02.000Z',
      jobTitle: 'CEO',
      name: { firstName: 'Tim', lastName: 'Apple' },
    });
  });
});
