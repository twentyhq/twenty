import { areDashboardFilterBindingsEqual } from '@/page-layout/dashboard-filters/utils/areDashboardFilterBindingsEqual';

describe('areDashboardFilterBindingsEqual', () => {
  it('treats absent optional members as null', () => {
    expect(
      areDashboardFilterBindingsEqual(
        { fieldMetadataId: 'field' },
        {
          fieldMetadataId: 'field',
          subFieldName: null,
          relationTargetFieldMetadataId: null,
        },
      ),
    ).toBe(true);
  });

  it('distinguishes bindings by relation target', () => {
    expect(
      areDashboardFilterBindingsEqual(
        { fieldMetadataId: 'field' },
        { fieldMetadataId: 'field', relationTargetFieldMetadataId: 'target' },
      ),
    ).toBe(false);
  });

  it('considers two unbound values equal and an unbound value different from a binding', () => {
    expect(areDashboardFilterBindingsEqual(null, undefined)).toBe(true);
    expect(
      areDashboardFilterBindingsEqual(null, { fieldMetadataId: 'field' }),
    ).toBe(false);
  });
});
