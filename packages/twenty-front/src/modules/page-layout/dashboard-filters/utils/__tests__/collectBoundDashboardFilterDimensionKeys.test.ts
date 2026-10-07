import { collectBoundDashboardFilterDimensionKeys } from '@/page-layout/dashboard-filters/utils/collectBoundDashboardFilterDimensionKeys';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const workspaceMemberObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workspaceMember');

const OBJECT_METADATA_ITEMS = [
  companyObjectMetadataItem,
  workspaceMemberObjectMetadataItem,
];

const getFieldOrThrow = (fieldName: string) => {
  const field = companyObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field;
};

describe('collectBoundDashboardFilterDimensionKeys', () => {
  it('collects the field key of a plain binding', () => {
    const keys = collectBoundDashboardFilterDimensionKeys({
      bindingsByWidgetId: {
        'company-widget': {
          date: { fieldMetadataId: getFieldOrThrow('createdAt').id },
        },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(keys).toEqual(
      new Set([
        getDashboardFilterFieldDimensionKey({
          name: 'createdAt',
          type: FieldMetadataType.DATE_TIME,
        }),
      ]),
    );
  });

  it('adds the relation target key for a relation binding and for an own id binding', () => {
    const keys = collectBoundDashboardFilterDimensionKeys({
      bindingsByWidgetId: {
        'company-widget': {
          owner: { fieldMetadataId: getFieldOrThrow('accountOwner').id },
          company: { fieldMetadataId: getFieldOrThrow('id').id },
        },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(
      keys.has(
        getDashboardFilterRelationTargetDimensionKey(
          workspaceMemberObjectMetadataItem.id,
        ),
      ),
    ).toBe(true);
    expect(
      keys.has(
        getDashboardFilterRelationTargetDimensionKey(
          companyObjectMetadataItem.id,
        ),
      ),
    ).toBe(true);
  });

  it('keys a binding through a target field by that target field, not by the relation', () => {
    const keys = collectBoundDashboardFilterDimensionKeys({
      bindingsByWidgetId: {
        'company-widget': {
          'owner-name': {
            fieldMetadataId: getFieldOrThrow('accountOwner').id,
            relationTargetFieldMetadataId:
              workspaceMemberObjectMetadataItem.fields.find(
                (field) => field.name === 'name',
              )?.id ?? '',
          },
        },
      },
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(keys).toEqual(
      new Set([
        getDashboardFilterFieldDimensionKey({
          name: 'name',
          type: FieldMetadataType.FULL_NAME,
        }),
      ]),
    );
  });
});
