import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const OBJECT_METADATA_ITEMS = [
  companyObjectMetadataItem,
  personObjectMetadataItem,
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

const companyIdFieldId = getFieldIdOrThrow(companyObjectMetadataItem, 'id');
const personCompanyFieldId = getFieldIdOrThrow(
  personObjectMetadataItem,
  'company',
);

describe('getDashboardFilterRepresentativeBinding', () => {
  it('returns the first non-null binding found across widgets', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-1': { date: null },
        'widget-2': { owner: { fieldMetadataId: 'owner-field-id' } },
        'widget-3': { date: { fieldMetadataId: 'created-at-field-id' } },
        'widget-4': { date: { fieldMetadataId: 'other-field-id' } },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(representativeBinding).toEqual({
      fieldMetadataId: 'created-at-field-id',
    });
  });

  it('prefers a relation binding over a binding through a chart object own id', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'company',
      bindingsByWidgetId: {
        'company-widget': { company: { fieldMetadataId: companyIdFieldId } },
        'person-widget': { company: { fieldMetadataId: personCompanyFieldId } },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(representativeBinding).toEqual({
      fieldMetadataId: personCompanyFieldId,
    });
  });

  it('falls back to the id binding when no relation binds the slot', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'company',
      bindingsByWidgetId: {
        'company-widget': { company: { fieldMetadataId: companyIdFieldId } },
        'person-widget': { company: null },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(representativeBinding).toEqual({
      fieldMetadataId: companyIdFieldId,
    });
  });

  it('returns undefined when no widget binds the slot', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-1': { date: null },
        'widget-2': {},
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(representativeBinding).toBeUndefined();
  });
});
