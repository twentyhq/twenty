import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const getRelationField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: getMockObjectMetadataItemOrThrow(objectNameSingular),
    fieldName,
  });

const withoutReadableField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}): EnrichedObjectMetadataItem[] =>
  objectMetadataItems.map((objectMetadataItem) =>
    objectMetadataItem.nameSingular === objectNameSingular
      ? {
          ...objectMetadataItem,
          readableFields: objectMetadataItem.readableFields.filter(
            ({ name }) => name !== fieldName,
          ),
        }
      : objectMetadataItem,
  );

describe('resolveScopedRelationJunction', () => {
  it('is not a junction for a relation to plain records', () => {
    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: getRelationField({
          objectNameSingular: 'company',
          fieldName: 'people',
        }),
        objectMetadataItems,
      }),
    ).toEqual({});
  });

  it('supports a junction resolved from the other side of the join object', () => {
    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: getRelationField({
          objectNameSingular: 'person',
          fieldName: 'taskTargets',
        }),
        objectMetadataItems,
      }),
    ).toMatchObject({
      scopedRelationJunction: {
        junctionConfig: {
          direction: 'reverse',
          junctionObjectMetadata: { nameSingular: 'taskTarget' },
        },
        targetFieldMetadataItem: { name: 'task' },
        targetObjectMetadataItem: { nameSingular: 'task' },
      },
    });
  });

  it('supports a junction configured on the relation itself', () => {
    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: getRelationField({
          objectNameSingular: 'person',
          fieldName: 'previousCompanies',
        }),
        objectMetadataItems,
      }),
    ).toMatchObject({
      scopedRelationJunction: {
        junctionConfig: {
          direction: 'forward',
          junctionObjectMetadata: { nameSingular: 'employmentHistory' },
        },
        targetFieldMetadataItem: { name: 'company' },
        targetObjectMetadataItem: { nameSingular: 'company' },
      },
    });
  });

  it('does not support a junction to records of several objects', () => {
    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: getRelationField({
          objectNameSingular: 'task',
          fieldName: 'taskTargets',
        }),
        objectMetadataItems,
      }),
    ).toBeUndefined();
  });

  it('does not support a junction whose configuration is invalid', () => {
    const companyPeopleField = getRelationField({
      objectNameSingular: 'company',
      fieldName: 'people',
    });

    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: {
          ...companyPeopleField,
          settings: {
            ...companyPeopleField.settings,
            junctionTargetFieldId: '20202020-0000-4000-8000-0000000000d1',
          },
        },
        objectMetadataItems,
      }),
    ).toBeUndefined();
  });

  it('does not support a junction whose target relation cannot be read', () => {
    expect(
      resolveScopedRelationJunction({
        fieldMetadataItem: getRelationField({
          objectNameSingular: 'person',
          fieldName: 'taskTargets',
        }),
        objectMetadataItems: withoutReadableField({
          objectNameSingular: 'taskTarget',
          fieldName: 'task',
        }),
      }),
    ).toBeUndefined();
  });
});
