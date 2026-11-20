import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const isScopable = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  isScopableRelationField({
    fieldMetadataItem: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow(objectNameSingular),
      fieldName,
    }),
    objectMetadataItems,
  });

describe('isScopableRelationField', () => {
  it('scopes a one-to-many relation to plain records', () => {
    expect(
      isScopable({ objectNameSingular: 'company', fieldName: 'people' }),
    ).toBe(true);
  });

  it('scopes a relation to a join object with one target object, whichever side configures it', () => {
    expect(
      isScopable({ objectNameSingular: 'person', fieldName: 'taskTargets' }),
    ).toBe(true);
    expect(
      isScopable({
        objectNameSingular: 'person',
        fieldName: 'previousCompanies',
      }),
    ).toBe(true);
  });

  it('does not scope a relation to a join object with several target objects', () => {
    expect(
      isScopable({ objectNameSingular: 'task', fieldName: 'taskTargets' }),
    ).toBe(false);
  });

  it('does not scope a many-to-one relation or a field that is not a relation', () => {
    expect(
      isScopable({ objectNameSingular: 'person', fieldName: 'company' }),
    ).toBe(false);
    expect(
      isScopable({ objectNameSingular: 'person', fieldName: 'jobTitle' }),
    ).toBe(false);
  });
});
