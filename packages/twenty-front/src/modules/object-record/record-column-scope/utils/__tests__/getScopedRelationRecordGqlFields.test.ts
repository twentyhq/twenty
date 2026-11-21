import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const personIdentifierGqlFields = buildIdentifierGqlFields(
  personObjectMetadataItem,
);

const buildLookupTarget = (
  fieldName: string,
): ScopedRelationAlias['lookupTarget'] => {
  const lookupTargetFieldMetadataItem = getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName,
  });

  return {
    relationFieldName: 'people',
    relationObjectMetadataItem: personObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition({
      field: lookupTargetFieldMetadataItem,
      objectMetadataItem: personObjectMetadataItem,
    }),
  };
};

const buildPeopleAlias = (
  scopedRelationAlias: Pick<ScopedRelationAlias, 'responseKey'> &
    Partial<ScopedRelationAlias>,
): ScopedRelationAlias => ({
  recordFieldId: 'people-column',
  relationFieldName: 'people',
  relationObjectMetadataItem: personObjectMetadataItem,
  ...scopedRelationAlias,
});

describe('getScopedRelationRecordGqlFields', () => {
  it('selects each scoped relation under its response key with the identifier of its records', () => {
    const limitedAlias = buildPeopleAlias({
      responseKey: 'people_limited',
      filter: { jobTitle: { ilike: '%cto%' } },
      orderBy: [{ createdAt: 'AscNullsLast' }],
      first: 2,
    });
    const unlimitedAlias = buildPeopleAlias({ responseKey: 'people_all' });

    expect(
      getScopedRelationRecordGqlFields({
        scopedRelationAliases: [limitedAlias, unlimitedAlias],
        objectMetadataItems,
      }),
    ).toEqual({
      people_limited: {
        relationFieldName: 'people',
        filter: limitedAlias.filter,
        orderBy: limitedAlias.orderBy,
        first: 2,
        recordGqlFields: personIdentifierGqlFields,
      },
      people_all: {
        relationFieldName: 'people',
        filter: undefined,
        orderBy: undefined,
        first: undefined,
        recordGqlFields: personIdentifierGqlFields,
      },
    });
  });

  it('selects the field a column shows next to the identifier of its records', () => {
    expect(
      getScopedRelationRecordGqlFields({
        scopedRelationAliases: [
          buildPeopleAlias({
            responseKey: 'people_limited',
            first: 2,
            lookupTarget: buildLookupTarget('emails'),
          }),
        ],
        objectMetadataItems,
      }),
    ).toEqual({
      people_limited: expect.objectContaining({
        first: 2,
        recordGqlFields: { ...personIdentifierGqlFields, emails: true },
      }),
    });
  });

  it('selects the fields of every column sharing one scope under their one response key', () => {
    expect(
      getScopedRelationRecordGqlFields({
        scopedRelationAliases: [
          buildPeopleAlias({
            responseKey: 'people_all',
            lookupTarget: buildLookupTarget('emails'),
          }),
          buildPeopleAlias({ responseKey: 'people_all' }),
          buildPeopleAlias({
            responseKey: 'people_all',
            lookupTarget: buildLookupTarget('jobTitle'),
          }),
        ],
        objectMetadataItems,
      }),
    ).toEqual({
      people_all: expect.objectContaining({
        recordGqlFields: {
          ...personIdentifierGqlFields,
          emails: true,
          jobTitle: true,
        },
      }),
    });
  });

  it('selects the target records of a join object relation with its join records', () => {
    const taskTargetObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('taskTarget');
    const { scopedRelationJunction } = resolveScopedRelationJunction({
      fieldMetadataItem: getMockFieldMetadataItemOrThrow({
        objectMetadataItem: personObjectMetadataItem,
        fieldName: 'taskTargets',
      }),
      objectMetadataItems,
    });

    expect(
      getScopedRelationRecordGqlFields({
        scopedRelationAliases: [
          {
            recordFieldId: 'task-targets-column',
            responseKey: 'taskTargets_limited',
            relationFieldName: 'taskTargets',
            relationObjectMetadataItem: taskTargetObjectMetadataItem,
            first: 1,
            scopedRelationJunction,
          },
        ],
        objectMetadataItems,
      }),
    ).toEqual({
      taskTargets_limited: expect.objectContaining({
        relationFieldName: 'taskTargets',
        recordGqlFields: {
          ...buildIdentifierGqlFields(taskTargetObjectMetadataItem),
          task: buildIdentifierGqlFields(
            getMockObjectMetadataItemOrThrow('task'),
          ),
        },
      }),
    });
  });
});
