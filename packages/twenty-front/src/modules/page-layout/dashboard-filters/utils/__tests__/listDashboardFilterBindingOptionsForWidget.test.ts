import {
  COMPANY_ACCOUNT_OWNER,
  COMPANY_CREATED_AT,
  COMPANY_OBJECT,
  COMPANY_NAME,
  OBJECT_METADATA_ITEMS,
  OPPORTUNITY_ASSIGNEE,
  OPPORTUNITY_OBJECT,
  OPPORTUNITY_OWNER,
  OPPORTUNITY_POINT_OF_CONTACT,
  PERSON_COMPANY,
  PERSON_OBJECT,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { listDashboardFilterBindingOptionsForWidget } from '@/page-layout/dashboard-filters/utils/listDashboardFilterBindingOptionsForWidget';

describe('listDashboardFilterBindingOptionsForWidget', () => {
  it('lists the object fields whose filter type matches the slot', () => {
    expect(
      listDashboardFilterBindingOptionsForWidget({
        slot: { filterType: 'TEXT' },
        objectMetadataItem: COMPANY_OBJECT,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual([
      {
        id: COMPANY_NAME.id,
        label: 'Name',
        binding: { fieldMetadataId: COMPANY_NAME.id },
      },
    ]);
  });

  it('does not offer relation traversals for non-relation slots', () => {
    const options = listDashboardFilterBindingOptionsForWidget({
      slot: { filterType: 'DATE_TIME' },
      objectMetadataItem: PERSON_OBJECT,
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(options.map((option) => option.label)).toEqual(['Creation date']);
  });

  it('offers relations and one-hop relations of relations for relation slots, sorted by label', () => {
    expect(
      listDashboardFilterBindingOptionsForWidget({
        slot: { filterType: 'RELATION' },
        objectMetadataItem: PERSON_OBJECT,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual([
      {
        id: PERSON_COMPANY.id,
        label: 'Company',
        binding: { fieldMetadataId: PERSON_COMPANY.id },
      },
      {
        id: `${PERSON_COMPANY.id}:${COMPANY_ACCOUNT_OWNER.id}`,
        label: 'Company → Account Owner',
        binding: {
          fieldMetadataId: PERSON_COMPANY.id,
          relationTargetFieldMetadataId: COMPANY_ACCOUNT_OWNER.id,
        },
      },
    ]);
  });

  it('lists every relation of the object before the traversals', () => {
    const options = listDashboardFilterBindingOptionsForWidget({
      slot: { filterType: 'RELATION' },
      objectMetadataItem: OPPORTUNITY_OBJECT,
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(options.map((option) => option.label)).toEqual([
      'Assignee',
      'Owner',
      'Point of Contact',
      'Point of Contact → Company',
    ]);
    expect(options.map((option) => option.binding.fieldMetadataId)).toEqual([
      OPPORTUNITY_ASSIGNEE.id,
      OPPORTUNITY_OWNER.id,
      OPPORTUNITY_POINT_OF_CONTACT.id,
      OPPORTUNITY_POINT_OF_CONTACT.id,
    ]);
  });

  it('returns nothing when no field matches', () => {
    expect(
      listDashboardFilterBindingOptionsForWidget({
        slot: { filterType: 'SELECT' },
        objectMetadataItem: COMPANY_OBJECT,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual([]);
    expect(COMPANY_CREATED_AT.type).toBe('DATE_TIME');
  });
});
