import { getRelationTargetFieldMetadataItems } from '@/object-record/record-field/utils/getRelationTargetFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const company = getMockObjectMetadataItemOrThrow('company');

describe('getRelationTargetFieldMetadataItems', () => {
  it('lists the active readable fields that pass the eligibility check', () => {
    const textFieldMetadataItems = getRelationTargetFieldMetadataItems({
      relationObjectMetadataItem: company,
      isEligible: ({ type }) => type === FieldMetadataType.TEXT,
    });

    expect(textFieldMetadataItems.map(({ name }) => name)).toContain('name');
    expect(
      textFieldMetadataItems.every(
        ({ type, isActive }) =>
          type === FieldMetadataType.TEXT && isActive !== false,
      ),
    ).toBe(true);
  });

  it('leaves out inactive fields', () => {
    const [firstFieldMetadataItem] = company.readableFields;

    expect(
      getRelationTargetFieldMetadataItems({
        relationObjectMetadataItem: {
          readableFields: [{ ...firstFieldMetadataItem, isActive: false }],
        },
        isEligible: () => true,
      }),
    ).toEqual([]);
  });

  it('lists the system fields last', () => {
    const isSystemByPosition = getRelationTargetFieldMetadataItems({
      relationObjectMetadataItem: company,
      isEligible: () => true,
    }).map(({ isSystem }) => isSystem === true);

    expect(isSystemByPosition).toContain(true);
    expect(isSystemByPosition).toEqual(isSystemByPosition.toSorted());
  });
});
