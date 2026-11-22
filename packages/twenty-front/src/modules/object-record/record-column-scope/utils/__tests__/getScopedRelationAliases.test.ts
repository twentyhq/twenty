import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import {
  type ViewFieldRelationScope,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { computeRelationWithArgumentsResponseKey } from 'twenty-shared/utils';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

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

const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const taskTargetObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('taskTarget');
const personTaskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'taskTargets',
});
const taskTargetTaskField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: taskTargetObjectMetadataItem,
  fieldName: 'task',
});
const taskTargetCreatedAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: taskTargetObjectMetadataItem,
  fieldName: 'createdAt',
});
const taskStatusField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: taskObjectMetadataItem,
  fieldName: 'status',
});
const taskTitleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: taskObjectMetadataItem,
  fieldName: 'title',
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
        relationWithArguments: { filter, orderBy, first },
      },
    ] = getAliases({
      recordFields: [getPeopleColumn({ relationScope: EMPTY_RELATION_SCOPE })],
    });

    expect(filter).toEqual({});
    expect(orderBy).toEqual([{ position: 'AscNullsFirst' }]);
    expect(first).toBeUndefined();
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

  it('selects the aggregate of a summary with the ids of its records only', () => {
    const [{ relationWithArguments, summary }] = getAliases({
      recordFields: [
        {
          ...getPeopleColumn({ relationScope: CTO_RELATION_SCOPE }),
          relationAggregateOperation: AggregateOperations.COUNT,
        },
      ],
    });

    expect(summary?.aggregateGqlFieldName).toBe('totalCount');
    expect(relationWithArguments).toMatchObject({
      aggregateGqlFieldNames: ['totalCount'],
      recordGqlFields: { id: true },
    });
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

  it('scopes a join object relation by the fields of its target records, which it lists', () => {
    const [taskTargetsAlias] = getScopedRelationAliases({
      recordFields: [
        {
          id: PEOPLE_COLUMN_ID,
          fieldMetadataItemId: personTaskTargetsField.id,
          isCanonical: false,
          relationScope: {
            filters: [
              {
                id: '20202020-0000-4000-8000-0000000000f2',
                fieldMetadataId: taskTargetTaskField.id,
                relationTargetFieldMetadataId: taskStatusField.id,
                operand: ViewFilterOperand.IS,
                value: ['TODO'],
              },
            ],
            filterGroups: [],
            sorts: [
              {
                fieldMetadataId: taskTargetTaskField.id,
                relationTargetFieldMetadataId: taskTitleField.id,
                direction: ViewSortDirection.DESC,
              },
            ],
            limit: 1,
          },
          relationTargetFieldMetadataId: taskTargetCreatedAtField.id,
        },
      ],
      fieldMetadataItemByFieldMetadataItemId: {
        [personTaskTargetsField.id]: personTaskTargetsField,
      },
      objectMetadataItems,
      fieldMetadataItems: [
        ...taskTargetObjectMetadataItem.fields,
        ...taskObjectMetadataItem.fields,
      ],
      filterValueDependencies: {},
      isLookupColumnsEnabled: true,
    });

    expect(taskTargetsAlias).toMatchObject({
      relationObjectMetadataItem: { nameSingular: 'taskTarget' },
      relationWithArguments: {
        relationFieldName: 'taskTargets',
        filter: { task: { status: { in: ['TODO'] } } },
        orderBy: [
          { task: { title: 'DescNullsLast' } },
          { position: 'AscNullsFirst' },
        ],
        first: 1,
        recordGqlFields: { task: expect.any(Object) },
      },
      scopedRelationJunction: {
        targetFieldMetadataItem: { name: 'task' },
        targetObjectMetadataItem: { nameSingular: 'task' },
      },
    });
    expect(taskTargetsAlias.lookupTarget).toBeUndefined();
  });
});
