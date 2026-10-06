import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { FieldMetadataType } from 'twenty-shared/types';

describe('getDashboardFilterFieldDimensionKey', () => {
  it('keys non-select fields by name and type', () => {
    expect(
      getDashboardFilterFieldDimensionKey({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        options: [{ value: 'ignored' }],
      }),
    ).toBe('createdAt:DATE_TIME');
  });

  it('keys select fields by their option values regardless of order', () => {
    const keyA = getDashboardFilterFieldDimensionKey({
      name: 'stage',
      type: FieldMetadataType.SELECT,
      options: [{ value: 'WON' }, { value: 'NEW' }],
    });
    const keyB = getDashboardFilterFieldDimensionKey({
      name: 'stage',
      type: FieldMetadataType.SELECT,
      options: [{ value: 'NEW' }, { value: 'WON' }],
    });
    const keyC = getDashboardFilterFieldDimensionKey({
      name: 'stage',
      type: FieldMetadataType.MULTI_SELECT,
      options: [{ value: 'NEW' }],
    });

    expect(keyA).toBe('stage:SELECT:NEW,WON');
    expect(keyA).toBe(keyB);
    expect(keyC).toBe('stage:MULTI_SELECT:NEW');
  });
});
