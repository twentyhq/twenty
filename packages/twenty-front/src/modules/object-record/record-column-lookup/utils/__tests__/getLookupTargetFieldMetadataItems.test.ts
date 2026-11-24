import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getLookupTargetFieldMetadataItems', () => {
  it('lists the active fields of the related object without its relations', () => {
    const company = getMockObjectMetadataItemOrThrow('company');

    const fieldNames = getLookupTargetFieldMetadataItems(company).map(
      ({ name }) => name,
    );

    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('employees');
    expect(fieldNames).not.toContain('people');
    expect(
      getLookupTargetFieldMetadataItems(company).every(
        ({ type, isActive }) =>
          type !== FieldMetadataType.RELATION &&
          type !== FieldMetadataType.MORPH_RELATION &&
          isActive !== false,
      ),
    ).toBe(true);
  });

  it('lists the system fields last', () => {
    const company = getMockObjectMetadataItemOrThrow('company');

    const isSystemByPosition = getLookupTargetFieldMetadataItems(company).map(
      ({ isSystem }) => isSystem === true,
    );

    expect(isSystemByPosition).toEqual(isSystemByPosition.toSorted());
  });
});
