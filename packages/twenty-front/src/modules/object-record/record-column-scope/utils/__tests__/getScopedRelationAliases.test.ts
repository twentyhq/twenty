import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import {
  type RecordGqlFieldsRelationWithArguments,
  type ViewFieldRelationScope,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { computeRelationWithArgumentsResponseKey } from 'twenty-shared/utils';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'people',
});
const emailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
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
const OTHER_PEOPLE_COLUMN_ID = '20202020-0000-4000-8000-0000000000c2';

const EMPTY_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [],
};

const CTO_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [
    {
      id: '20202020-0000-4000-8000-0000000000f1',
      fieldMetadataId: jobTitleField.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'cto',
    },
  ],
  filterGroups: [],
  sorts: [
    {
      fieldMetadataId: createdAtField.id,
      direction: ViewSortDirection.ASC,
    },
  ],
  limit: 2,
};

const getAliases = ({
  recordFields,
  isLookupColumnsEnabled = true,
}: {
  recordFields: Parameters<typeof getScopedRelationAliases>[0]['recordFields'];
  isLookupColumnsEnabled?: boolean;
}) =>
  getScopedRelationAliases({
    recordFields,
    fieldMetadataItemByFieldMetadataItemId: { [peopleField.id]: peopleField },
    objectMetadataItems,
    fieldMetadataItems: personObjectMetadataItem.fields,
    filterValueDependencies: {},
    isLookupColumnsEnabled,
  });

const getPeopleColumn = ({
  relationScope,
  id = PEOPLE_COLUMN_ID,
  relationTargetFieldMetadataId,
}: {
  relationScope: ViewFieldRelationScope;
  id?: string;
  relationTargetFieldMetadataId?: string;
}) => ({
  id,
  fieldMetadataItemId: peopleField.id,
  isCanonical: false,
  relationScope,
  relationTargetFieldMetadataId,
});

const CTO_RELATION_WITH_ARGUMENTS: Omit<
  RecordGqlFieldsRelationWithArguments,
  'recordGqlFields'
> = {
  relationFieldName: 'people',
  filter: { jobTitle: { ilike: '%cto%' } },
  orderBy: [{ createdAt: 'AscNullsLast' }, { position: 'AscNullsFirst' }],
  first: 2,
  aggregateGqlFieldNames: ['totalCount'],
};

describe('getScopedRelationAliases', () => {
  it('turns the scope filters, sorts and limit into nested arguments', () => {
    const [scopedRelationAlias] = getAliases({
      recordFields: [getPeopleColumn({ relationScope: CTO_RELATION_SCOPE })],
    });

    expect(scopedRelationAlias).toEqual({
      recordFieldId: PEOPLE_COLUMN_ID,
      responseKey: computeRelationWithArgumentsResponseKey(
        scopedRelationAlias.relationWithArguments,
      ),
      relationObjectMetadataItem: expect.objectContaining({
        id: personObjectMetadataItem.id,
      }),
      relationWithArguments: {
        ...CTO_RELATION_WITH_ARGUMENTS,
        recordGqlFields: expect.objectContaining({ id: true }),
      },
    });
  });

  it('keeps the default order and no limit for an empty scope', () => {
    const [
      {
        relationWithArguments: {
          filter,
          orderBy,
          first,
          aggregateGqlFieldNames,
        },
      },
    ] = getAliases({
      recordFields: [getPeopleColumn({ relationScope: EMPTY_RELATION_SCOPE })],
    });

    expect(filter).toEqual({});
    expect(orderBy).toEqual([{ position: 'AscNullsFirst' }]);
    expect(first).toBeUndefined();
    expect(aggregateGqlFieldNames).toBeUndefined();
  });

  it('carries the field of the related records a column shows', () => {
    const [{ lookupTarget }] = getAliases({
      recordFields: [
        getPeopleColumn({
          relationScope: CTO_RELATION_SCOPE,
          relationTargetFieldMetadataId: emailsField.id,
        }),
      ],
    });

    expect(lookupTarget?.lookupTargetFieldMetadataItem.id).toBe(emailsField.id);
    expect(lookupTarget?.lookupTargetFieldDefinition.metadata.fieldName).toBe(
      'emails',
    );
  });

  it('gives two columns of one relation their own response key', () => {
    const [ctoAlias, allPeopleAlias] = getAliases({
      recordFields: [
        getPeopleColumn({ relationScope: CTO_RELATION_SCOPE }),
        getPeopleColumn({
          relationScope: EMPTY_RELATION_SCOPE,
          id: OTHER_PEOPLE_COLUMN_ID,
        }),
      ],
    });

    expect(ctoAlias.recordFieldId).toBe(PEOPLE_COLUMN_ID);
    expect(allPeopleAlias.recordFieldId).toBe(OTHER_PEOPLE_COLUMN_ID);
    expect(ctoAlias.responseKey).not.toBe(allPeopleAlias.responseKey);
  });

  it('skips the canonical column, columns without a scope and a disabled flag', () => {
    expect(
      getAliases({
        recordFields: [
          {
            ...getPeopleColumn({ relationScope: CTO_RELATION_SCOPE }),
            isCanonical: true,
          },
          {
            ...getPeopleColumn({ relationScope: CTO_RELATION_SCOPE }),
            relationScope: null,
          },
        ],
      }),
    ).toEqual([]);
    expect(
      getAliases({
        recordFields: [getPeopleColumn({ relationScope: CTO_RELATION_SCOPE })],
        isLookupColumnsEnabled: false,
      }),
    ).toEqual([]);
  });
});
