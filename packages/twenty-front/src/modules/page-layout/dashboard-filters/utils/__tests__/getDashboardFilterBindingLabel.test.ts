import {
  COMPANY_ACCOUNT_OWNER,
  OBJECT_METADATA_ITEMS,
  PERSON_COMPANY,
  PERSON_OBJECT_ID,
  buildField,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { FieldMetadataType } from 'twenty-shared/types';

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

  it('names the composite sub-field a binding targets', () => {
    const nameField = buildField({
      id: 'person-name',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.FULL_NAME,
    });
    const objectMetadataItems = [
      ...OBJECT_METADATA_ITEMS,
      { id: `${PERSON_OBJECT_ID}-with-name`, fields: [nameField] },
    ];

    expect(
      getDashboardFilterBindingLabel({
        binding: { fieldMetadataId: nameField.id, subFieldName: 'firstName' },
        objectMetadataItems,
      }),
    ).toBe(
      `Name ${getCompositeSubFieldLabel(FieldMetadataType.FULL_NAME, 'firstName')}`,
    );
    expect(
      getDashboardFilterBindingLabel({
        binding: {
          fieldMetadataId: PERSON_COMPANY.id,
          relationTargetFieldMetadataId: nameField.id,
          subFieldName: 'lastName',
        },
        objectMetadataItems,
      }),
    ).toBe(
      `Company → Name ${getCompositeSubFieldLabel(FieldMetadataType.FULL_NAME, 'lastName')}`,
    );
  });

  it('ignores a sub-field on a non-composite field', () => {
    expect(
      getDashboardFilterBindingLabel({
        binding: {
          fieldMetadataId: PERSON_COMPANY.id,
          subFieldName: 'firstName',
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Company');
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
