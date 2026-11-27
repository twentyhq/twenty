import { resolveScopableRelation } from '@/object-record/record-column-scope/utils/resolveScopableRelation';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const resolveFieldRelation = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  resolveScopableRelation({
    fieldMetadataItem: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow(objectNameSingular),
      fieldName,
    }),
    objectMetadataItems,
  });

describe('resolveScopableRelation', () => {
  it('scopes a one-to-many relation to plain records', () => {
    expect(
      resolveFieldRelation({
        objectNameSingular: 'company',
        fieldName: 'people',
      }),
    ).toEqual({
      relationObjectMetadataItem: expect.objectContaining({
        nameSingular: 'person',
      }),
      scopedRelationJunction: undefined,
    });
  });

  it('scopes a relation to a join object with one target object, whichever side configures it', () => {
    expect(
      resolveFieldRelation({
        objectNameSingular: 'person',
        fieldName: 'taskTargets',
      })?.scopedRelationJunction?.targetObjectMetadataItem.nameSingular,
    ).toBe('task');
    expect(
      resolveFieldRelation({
        objectNameSingular: 'person',
        fieldName: 'previousCompanies',
      })?.scopedRelationJunction,
    ).toBeDefined();
  });

  it('does not scope a relation to a join object with several target objects', () => {
    expect(
      resolveFieldRelation({
        objectNameSingular: 'task',
        fieldName: 'taskTargets',
      }),
    ).toBeUndefined();
  });

  it('does not scope a many-to-one relation or a field that is not a relation', () => {
    expect(
      resolveFieldRelation({
        objectNameSingular: 'person',
        fieldName: 'company',
      }),
    ).toBeUndefined();
    expect(
      resolveFieldRelation({
        objectNameSingular: 'person',
        fieldName: 'jobTitle',
      }),
    ).toBeUndefined();
  });
});
