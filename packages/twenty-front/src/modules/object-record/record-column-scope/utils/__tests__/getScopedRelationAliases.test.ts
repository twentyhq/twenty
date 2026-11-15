import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { ViewFilterOperand, ViewSortDirection } from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'people',
});
const jobTitleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'jobTitle',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'createdAt',
});

const PEOPLE_COLUMN_ID = '20202020-0000-4000-8000-0000000000c1';

const getAliases = ({
  recordLimit = null,
  scopeView,
  objectPermissionsByObjectMetadataId = {},
}: {
  recordLimit?: number | null;
  scopeView?: Parameters<
    typeof getScopedRelationAliases
  >[0]['scopeViewsByOwnerViewFieldIdMap'] extends Map<string, infer TScopeView>
    ? TScopeView
    : never;
  objectPermissionsByObjectMetadataId?: Parameters<
    typeof getScopedRelationAliases
  >[0]['objectPermissionsByObjectMetadataId'];
}) =>
  getScopedRelationAliases({
    recordFields: [
      {
        id: PEOPLE_COLUMN_ID,
        fieldMetadataItemId: peopleField.id,
        settings: { recordLimit },
      },
    ],
    fieldMetadataItemByFieldMetadataItemId: { [peopleField.id]: peopleField },
    scopeViewsByOwnerViewFieldIdMap: new Map(
      scopeView ? [[PEOPLE_COLUMN_ID, scopeView]] : [],
    ),
    objectMetadataItems,
    fieldMetadataItems: personObjectMetadataItem.fields,
    filterValueDependencies: {},
    objectPermissionsByObjectMetadataId,
  });

describe('getScopedRelationAliases', () => {
  it('only limits related records when the column has no scope view', () => {
    expect(getAliases({ recordLimit: 2 })).toEqual([
      expect.objectContaining({
        ownerViewFieldId: PEOPLE_COLUMN_ID,
        alias: 'scope_202020200000400080000000000000c1',
        fieldName: 'people',
        filter: {},
        orderBy: [{ position: 'AscNullsFirst' }],
        first: 2,
      }),
    ]);
  });

  it('turns the scope view filters and sorts into nested arguments', () => {
    const [{ filter, orderBy, first }] = getAliases({
      scopeView: {
        id: '20202020-0000-4000-8000-000000000001',
        viewFilters: [
          {
            id: '20202020-0000-4000-8000-0000000000f1',
            fieldMetadataId: jobTitleField.id,
            operand: ViewFilterOperand.CONTAINS,
            value: 'cto',
          },
        ],
        viewFilterGroups: [],
        viewSorts: [
          {
            id: '20202020-0000-4000-8000-0000000000f2',
            fieldMetadataId: createdAtField.id,
            direction: ViewSortDirection.ASC,
          },
        ],
      },
    });

    expect(filter).toEqual({ jobTitle: { ilike: '%cto%' } });
    expect(orderBy).toEqual([
      { createdAt: 'AscNullsLast' },
      { position: 'AscNullsFirst' },
    ]);
    expect(first).toBeUndefined();
  });

  it('skips a scoped column whose related object the user cannot read', () => {
    expect(
      getAliases({
        recordLimit: 2,
        objectPermissionsByObjectMetadataId: {
          [personObjectMetadataItem.id]: {
            ...getDefaultObjectPermissions(),
            canReadAllRecords: false,
          },
        },
      }),
    ).toEqual([]);
  });
});
