import { getScopedRelationColumn } from '@/object-record/record-column-scope/utils/getScopedRelationColumn';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});
const personTaskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'taskTargets',
});
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});

const EMPTY_RELATION_SCOPE = { filters: [], filterGroups: [], sorts: [] };

const SCOPED_RECORD_FIELD = {
  isCanonical: false,
  relationScope: EMPTY_RELATION_SCOPE,
};

type GetScopedRelationColumnArgs = Parameters<
  typeof getScopedRelationColumn
>[0];

const getColumn = ({
  recordField = SCOPED_RECORD_FIELD,
  fieldMetadataItem = companyPeopleField,
  isLookupColumnsEnabled = true,
}: Partial<Omit<GetScopedRelationColumnArgs, 'objectMetadataItems'>> = {}) =>
  getScopedRelationColumn({
    recordField,
    fieldMetadataItem,
    objectMetadataItems,
    isLookupColumnsEnabled,
  });

describe('getScopedRelationColumn', () => {
  it('resolves an added column with a scope on a one-to-many relation', () => {
    expect(getColumn()).toEqual({
      relationObjectMetadataItem: expect.objectContaining({
        id: personObjectMetadataItem.id,
      }),
    });
  });

  it.each([
    {
      title: 'a column without a scope',
      args: { recordField: { isCanonical: false, relationScope: null } },
    },
    {
      title: 'the canonical column of the field',
      args: { recordField: { relationScope: EMPTY_RELATION_SCOPE } },
    },
    {
      title: 'a many-to-one relation',
      args: {
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: personObjectMetadataItem,
          fieldName: 'company',
        }),
      },
    },
    {
      title: 'a relation to a join object with several target objects',
      args: {
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: getMockObjectMetadataItemOrThrow('task'),
          fieldName: 'taskTargets',
        }),
      },
    },
    {
      title: 'a relation whose junction is invalid',
      args: {
        fieldMetadataItem: {
          ...companyPeopleField,
          settings: {
            ...companyPeopleField.settings,
            junctionTargetFieldId: '20202020-0000-4000-8000-0000000000d1',
          },
        },
      },
    },
    {
      title: 'a column while lookup columns are disabled',
      args: { isLookupColumnsEnabled: false },
    },
  ])('is not scoped for $title', ({ args }) => {
    expect(getColumn(args)).toBeUndefined();
  });

  it('resolves the field of the related records a scoped column shows', () => {
    expect(
      getColumn({
        recordField: {
          ...SCOPED_RECORD_FIELD,
          relationTargetFieldMetadataId: emailsField.id,
        },
      })?.lookupTarget,
    ).toMatchObject({
      relationFieldName: 'people',
      relationObjectMetadataItem: { id: personObjectMetadataItem.id },
      lookupTargetFieldMetadataItem: { id: emailsField.id },
      lookupTargetFieldDefinition: { metadata: { fieldName: 'emails' } },
    });
  });

  it('has no lookup target for a field that is not on the related object', () => {
    const scopedRelationColumn = getColumn({
      recordField: {
        ...SCOPED_RECORD_FIELD,
        relationTargetFieldMetadataId: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: companyObjectMetadataItem,
          fieldName: 'name',
        }).id,
      },
    });

    expect(scopedRelationColumn).toBeDefined();
    expect(scopedRelationColumn?.lookupTarget).toBeUndefined();
  });

  it('resolves the join object of a relation with one target object, without a lookup target', () => {
    const scopedRelationColumn = getColumn({
      fieldMetadataItem: personTaskTargetsField,
      recordField: {
        ...SCOPED_RECORD_FIELD,
        relationTargetFieldMetadataId: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: getMockObjectMetadataItemOrThrow('taskTarget'),
          fieldName: 'createdAt',
        }).id,
      },
    });

    expect(scopedRelationColumn?.lookupTarget).toBeUndefined();
    expect(
      scopedRelationColumn?.scopedRelationJunction?.targetObjectMetadataItem
        .nameSingular,
    ).toBe('task');
  });
});
