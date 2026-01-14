import { getSortLabelSuffixForFieldType } from '@/command-menu/pages/page-layout/utils/getSortLabelSuffixForFieldType';
import { FieldMetadataType } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';

describe('getSortLabelSuffixForFieldType', () => {
  it('returns alphabetical for TEXT field with FIELD_ASC', () => {
    expect(
      getSortLabelSuffixForFieldType({
        fieldType: FieldMetadataType.TEXT,
        orderBy: GraphOrderBy.FIELD_ASC,
      }),
    ).toBe('alphabetical');
  });

  it('returns ascending for NUMBER field with FIELD_ASC', () => {
    expect(
      getSortLabelSuffixForFieldType({
        fieldType: FieldMetadataType.NUMBER,
        orderBy: GraphOrderBy.FIELD_ASC,
      }),
    ).toBe('ascending');
  });

  it('returns position ascending for SELECT field with FIELD_POSITION_ASC', () => {
    expect(
      getSortLabelSuffixForFieldType({
        fieldType: FieldMetadataType.SELECT,
        orderBy: GraphOrderBy.FIELD_POSITION_ASC,
      }),
    ).toBe('position ascending');
  });
});
