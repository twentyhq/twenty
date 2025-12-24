import { FieldMetadataType } from 'twenty-shared/types';

import { getChartDefaultOrderByForFieldType } from '@/command-menu/pages/page-layout/utils/getChartDefaultOrderByForFieldType';
import { GraphOrderBy } from '~/generated/graphql';

describe('getChartDefaultOrderByForFieldType', () => {
  it('should return FIELD_POSITION_ASC for SELECT field type', () => {
    expect(getChartDefaultOrderByForFieldType(FieldMetadataType.SELECT)).toBe(
      GraphOrderBy.FIELD_POSITION_ASC,
    );
  });

  it('should return FIELD_ASC for TEXT field type', () => {
    expect(getChartDefaultOrderByForFieldType(FieldMetadataType.TEXT)).toBe(
      GraphOrderBy.FIELD_ASC,
    );
  });

  it('should return FIELD_ASC for NUMBER field type', () => {
    expect(getChartDefaultOrderByForFieldType(FieldMetadataType.NUMBER)).toBe(
      GraphOrderBy.FIELD_ASC,
    );
  });

  it('should return FIELD_ASC for DATE field type', () => {
    expect(getChartDefaultOrderByForFieldType(FieldMetadataType.DATE)).toBe(
      GraphOrderBy.FIELD_ASC,
    );
  });

  it('should return FIELD_ASC for MULTI_SELECT field type', () => {
    expect(
      getChartDefaultOrderByForFieldType(FieldMetadataType.MULTI_SELECT),
    ).toBe(GraphOrderBy.FIELD_ASC);
  });
});
