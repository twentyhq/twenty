import {
  COMPANY_ACCOUNT_OWNER,
  OBJECT_METADATA_ITEMS,
  PERSON_COMPANY,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';

describe('getDashboardFilterBindingLabel', () => {
  it('returns the bound field label', () => {
    expect(
      getDashboardFilterBindingLabel({
        binding: { fieldMetadataId: PERSON_COMPANY.id },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Company');
  });

  it('joins the relation and target labels for a one-hop binding', () => {
    expect(
      getDashboardFilterBindingLabel({
        binding: {
          fieldMetadataId: PERSON_COMPANY.id,
          relationTargetFieldMetadataId: COMPANY_ACCOUNT_OWNER.id,
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Company → Account Owner');
  });

  it('returns undefined when the bound field or its target was deleted', () => {
    expect(
      getDashboardFilterBindingLabel({
        binding: { fieldMetadataId: 'deleted-field' },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBeUndefined();
    expect(
      getDashboardFilterBindingLabel({
        binding: {
          fieldMetadataId: PERSON_COMPANY.id,
          relationTargetFieldMetadataId: 'deleted-field',
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBeUndefined();
  });
});
