import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const jobTitleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'jobTitle',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'createdAt',
});
const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});
const companyEmployeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});

const JOB_TITLE_FILTER_ID = '20202020-0000-4000-8000-0000000000f1';
const EMPLOYEES_FILTER_ID = '20202020-0000-4000-8000-0000000000f2';
const FILTER_GROUP_ID = '20202020-0000-4000-8000-0000000000a1';
const CHILD_FILTER_GROUP_ID = '20202020-0000-4000-8000-0000000000a2';

const fieldMetadataItems = [
  ...personObjectMetadataItem.fields,
  ...companyObjectMetadataItem.fields,
];

describe('getRelationScopeRecordFiltersAndSorts', () => {
  it('turns scope filters into record filters, keeping their group and typed value', () => {
    const { recordFilters } = getRelationScopeRecordFiltersAndSorts({
      relationScope: {
        filters: [
          {
            id: JOB_TITLE_FILTER_ID,
            fieldMetadataId: jobTitleField.id,
            operand: ViewFilterOperand.CONTAINS,
            value: 'cto',
            filterGroupId: FILTER_GROUP_ID,
          },
          {
            id: EMPLOYEES_FILTER_ID,
            fieldMetadataId: personCompanyField.id,
            relationTargetFieldMetadataId: companyEmployeesField.id,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: 100,
          },
        ],
        filterGroups: [],
        sorts: [],
      },
      fieldMetadataItems,
    });

    expect(recordFilters).toEqual([
      expect.objectContaining({
        id: JOB_TITLE_FILTER_ID,
        fieldMetadataId: jobTitleField.id,
        operand: ViewFilterOperand.CONTAINS,
        value: 'cto',
        type: 'TEXT',
        label: jobTitleField.label,
        recordFilterGroupId: FILTER_GROUP_ID,
      }),
      expect.objectContaining({
        id: EMPLOYEES_FILTER_ID,
        fieldMetadataId: personCompanyField.id,
        relationTargetFieldMetadataId: companyEmployeesField.id,
        value: '100',
        type: 'NUMBER',
        recordFilterGroupId: undefined,
      }),
    ]);
  });

  it('leaves out a filter on a field that is not among the given fields', () => {
    const { recordFilters } = getRelationScopeRecordFiltersAndSorts({
      relationScope: {
        filters: [
          {
            id: EMPLOYEES_FILTER_ID,
            fieldMetadataId: personCompanyField.id,
            relationTargetFieldMetadataId: companyEmployeesField.id,
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: 100,
          },
        ],
        filterGroups: [],
        sorts: [],
      },
      fieldMetadataItems: personObjectMetadataItem.fields,
    });

    expect(recordFilters).toEqual([]);
  });

  it('turns scope filter groups into record filter groups', () => {
    const { recordFilterGroups } = getRelationScopeRecordFiltersAndSorts({
      relationScope: {
        filters: [],
        filterGroups: [
          {
            id: FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
          {
            id: CHILD_FILTER_GROUP_ID,
            parentFilterGroupId: FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.OR,
          },
        ],
        sorts: [],
      },
      fieldMetadataItems,
    });

    expect(recordFilterGroups).toEqual([
      {
        id: FILTER_GROUP_ID,
        parentRecordFilterGroupId: undefined,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      },
      {
        id: CHILD_FILTER_GROUP_ID,
        parentRecordFilterGroupId: FILTER_GROUP_ID,
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
        positionInRecordFilterGroup: 1,
      },
    ]);
  });

  it('positions filters by rank and filter groups after them', () => {
    const { recordFilters, recordFilterGroups } =
      getRelationScopeRecordFiltersAndSorts({
        relationScope: {
          filters: [
            {
              id: JOB_TITLE_FILTER_ID,
              fieldMetadataId: jobTitleField.id,
              operand: ViewFilterOperand.CONTAINS,
              value: 'cto',
              filterGroupId: FILTER_GROUP_ID,
            },
            {
              id: EMPLOYEES_FILTER_ID,
              fieldMetadataId: jobTitleField.id,
              operand: ViewFilterOperand.CONTAINS,
              value: 'ceo',
              filterGroupId: FILTER_GROUP_ID,
            },
          ],
          filterGroups: [
            {
              id: FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
            {
              id: CHILD_FILTER_GROUP_ID,
              parentFilterGroupId: FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
          sorts: [],
        },
        fieldMetadataItems,
      });

    expect(
      [...recordFilters, ...recordFilterGroups].map(
        ({ id, positionInRecordFilterGroup }) => [
          id,
          positionInRecordFilterGroup,
        ],
      ),
    ).toEqual([
      [JOB_TITLE_FILTER_ID, 0],
      [EMPLOYEES_FILTER_ID, 1],
      [FILTER_GROUP_ID, 2],
      [CHILD_FILTER_GROUP_ID, 3],
    ]);
  });

  it('keeps scope sorts in order', () => {
    const { recordSorts } = getRelationScopeRecordFiltersAndSorts({
      relationScope: {
        filters: [],
        filterGroups: [],
        sorts: [
          {
            fieldMetadataId: createdAtField.id,
            direction: ViewSortDirection.DESC,
          },
          {
            fieldMetadataId: jobTitleField.id,
            direction: ViewSortDirection.ASC,
          },
        ],
      },
      fieldMetadataItems,
    });

    expect(recordSorts).toEqual([
      expect.objectContaining({
        fieldMetadataId: createdAtField.id,
        direction: ViewSortDirection.DESC,
      }),
      expect.objectContaining({
        fieldMetadataId: jobTitleField.id,
        direction: ViewSortDirection.ASC,
      }),
    ]);
    expect(new Set(recordSorts.map(({ id }) => id)).size).toBe(2);
  });
});
