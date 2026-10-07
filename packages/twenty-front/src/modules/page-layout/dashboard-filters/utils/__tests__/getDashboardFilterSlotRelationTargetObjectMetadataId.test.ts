import { getDashboardFilterSlotRelationTargetObjectMetadataId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotRelationTargetObjectMetadataId';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const workspaceMemberObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workspaceMember');

const OBJECT_METADATA_ITEMS = [
  companyObjectMetadataItem,
  personObjectMetadataItem,
  workspaceMemberObjectMetadataItem,
];

const getFieldIdOrThrow = (
  objectMetadataItem: { fields: { id: string; name: string }[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field.id;
};

describe('getDashboardFilterSlotRelationTargetObjectMetadataId', () => {
  it('derives the target from a MANY_TO_ONE relation binding', () => {
    expect(
      getDashboardFilterSlotRelationTargetObjectMetadataId({
        slotId: 'owner',
        bindingsByWidgetId: {
          'company-widget': {
            owner: {
              fieldMetadataId: getFieldIdOrThrow(
                companyObjectMetadataItem,
                'accountOwner',
              ),
            },
          },
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe(workspaceMemberObjectMetadataItem.id);
  });

  it('derives the target from a binding to the chart object own id', () => {
    expect(
      getDashboardFilterSlotRelationTargetObjectMetadataId({
        slotId: 'company',
        bindingsByWidgetId: {
          'company-widget': {
            company: {
              fieldMetadataId: getFieldIdOrThrow(
                companyObjectMetadataItem,
                'id',
              ),
            },
          },
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe(companyObjectMetadataItem.id);
  });

  it('skips null, unknown and non-relation bindings until one names a target', () => {
    expect(
      getDashboardFilterSlotRelationTargetObjectMetadataId({
        slotId: 'company',
        bindingsByWidgetId: {
          'first-widget': { company: null },
          'second-widget': { company: { fieldMetadataId: 'deleted-field-id' } },
          'third-widget': {
            company: {
              fieldMetadataId: getFieldIdOrThrow(
                companyObjectMetadataItem,
                'name',
              ),
            },
          },
          'person-widget': {
            company: {
              fieldMetadataId: getFieldIdOrThrow(
                personObjectMetadataItem,
                'company',
              ),
            },
          },
        },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe(companyObjectMetadataItem.id);
  });

  it('returns undefined when nothing binds the slot', () => {
    expect(
      getDashboardFilterSlotRelationTargetObjectMetadataId({
        slotId: 'company',
        bindingsByWidgetId: { 'company-widget': { company: null } },
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBeUndefined();
  });
});
