import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const peopleField = getMockObjectMetadataItemOrThrow('company').fields.find(
  ({ name }) => name === 'people',
);

if (!isDefined(peopleField)) {
  throw new Error('company.people not found');
}

const PEOPLE_COLUMN = {
  id: '20202020-0000-4000-8000-0000000000c1',
  fieldMetadataItemId: peopleField.id,
  settings: { recordLimit: 2 },
};

const getAliases = (
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getScopedRelationAliases
  >[0]['objectPermissionsByObjectMetadataId'],
) =>
  getScopedRelationAliases({
    recordFields: [PEOPLE_COLUMN],
    fieldMetadataItemByFieldMetadataItemId: { [peopleField.id]: peopleField },
    scopeViewsByOwnerViewFieldIdMap: new Map(),
    objectMetadataItems,
    fieldMetadataItems: personObjectMetadataItem.fields,
    filterValueDependencies: {},
    objectPermissionsByObjectMetadataId,
  });

describe('getScopedRelationAliases', () => {
  it('aliases a scoped column on a readable related object', () => {
    expect(getAliases({})).toEqual([
      expect.objectContaining({
        alias: expect.stringContaining('scope_'),
        fieldName: 'people',
        first: 2,
      }),
    ]);
  });

  it('skips a scoped column whose related object the user cannot read', () => {
    expect(
      getAliases({
        [personObjectMetadataItem.id]: {
          ...getDefaultObjectPermissions(),
          canReadAllRecords: false,
        },
      }),
    ).toEqual([]);
  });
});
