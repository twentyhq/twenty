import { isSameRecordSortTarget } from '@/object-record/record-sort/utils/isSameRecordSortTarget';

describe('isSameRecordSortTarget', () => {
  it('matches two sorts on the same own field', () => {
    expect(
      isSameRecordSortTarget(
        { fieldMetadataId: 'company' },
        { fieldMetadataId: 'company', relationTargetFieldMetadataId: null },
      ),
    ).toBe(true);
  });

  it('distinguishes a sort on the relation from a sort through it', () => {
    expect(
      isSameRecordSortTarget(
        { fieldMetadataId: 'company' },
        {
          fieldMetadataId: 'company',
          relationTargetFieldMetadataId: 'employees',
        },
      ),
    ).toBe(false);
  });

  it('matches two sorts through the same target field', () => {
    expect(
      isSameRecordSortTarget(
        {
          fieldMetadataId: 'company',
          relationTargetFieldMetadataId: 'employees',
        },
        {
          fieldMetadataId: 'company',
          relationTargetFieldMetadataId: 'employees',
        },
      ),
    ).toBe(true);
  });
});
