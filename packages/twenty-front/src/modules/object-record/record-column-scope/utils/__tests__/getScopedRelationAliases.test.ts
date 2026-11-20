import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import {
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
const jobTitleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'jobTitle',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'createdAt',
});

const personIdentifierGqlFields = buildIdentifierGqlFields(
  personObjectMetadataItem,
);

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
}: {
  relationScope: ViewFieldRelationScope;
  id?: string;
}) => ({
  id,
  fieldMetadataItemId: peopleField.id,
  isCanonical: false,
  relationScope,
});

describe('getScopedRelationAliases', () => {
  it('turns the scope filters, sorts and limit into nested arguments', () => {
    expect(
      getAliases({
        recordFields: [getPeopleColumn({ relationScope: CTO_RELATION_SCOPE })],
      }),
    ).toEqual([
      {
        recordFieldId: PEOPLE_COLUMN_ID,
        responseKey: computeRelationWithArgumentsResponseKey({
          relationFieldName: 'people',
          filter: { jobTitle: { ilike: '%cto%' } },
          orderBy: [
            { createdAt: 'AscNullsLast' },
            { position: 'AscNullsFirst' },
          ],
          first: 2,
        }),
        relationFieldName: 'people',
        relationObjectMetadataItem: expect.objectContaining({
          id: personObjectMetadataItem.id,
        }),
        relationJoinColumnName: 'companyId',
        filter: { jobTitle: { ilike: '%cto%' } },
        orderBy: [{ createdAt: 'AscNullsLast' }, { position: 'AscNullsFirst' }],
        first: 2,
      },
    ]);
  });

  it('keeps the default order and no limit for an empty scope', () => {
    const [{ filter, orderBy, first }] = getAliases({
      recordFields: [getPeopleColumn({ relationScope: EMPTY_RELATION_SCOPE })],
    });

    expect(filter).toEqual({});
    expect(orderBy).toEqual([{ position: 'AscNullsFirst' }]);
    expect(first).toBeUndefined();
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

describe('getScopedRelationRecordGqlFields', () => {
  it('selects each scoped relation under its response key with the identifier of its records', () => {
    const [ctoAlias, allPeopleAlias] = getAliases({
      recordFields: [
        getPeopleColumn({ relationScope: CTO_RELATION_SCOPE }),
        getPeopleColumn({
          relationScope: EMPTY_RELATION_SCOPE,
          id: OTHER_PEOPLE_COLUMN_ID,
        }),
      ],
    });

    expect(
      getScopedRelationRecordGqlFields([ctoAlias, allPeopleAlias]),
    ).toEqual({
      [ctoAlias.responseKey]: {
        relationFieldName: 'people',
        filter: ctoAlias.filter,
        orderBy: ctoAlias.orderBy,
        first: 2,
        shouldIncludeTotalCount: true,
        recordGqlFields: personIdentifierGqlFields,
      },
      [allPeopleAlias.responseKey]: {
        relationFieldName: 'people',
        filter: allPeopleAlias.filter,
        orderBy: allPeopleAlias.orderBy,
        first: undefined,
        shouldIncludeTotalCount: false,
        recordGqlFields: personIdentifierGqlFields,
      },
    });
  });
});
