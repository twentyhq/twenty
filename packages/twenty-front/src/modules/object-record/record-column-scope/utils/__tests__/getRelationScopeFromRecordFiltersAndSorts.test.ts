import { getRelationScopeFromRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeFromRecordFiltersAndSorts';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import {
  RecordFilterGroupLogicalOperator,
  type ViewFieldRelationScope,
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
const cityField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'city',
});
const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'name',
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

const fieldMetadataItems = [
  ...personObjectMetadataItem.fields,
  ...companyObjectMetadataItem.fields,
];

const JOB_TITLE_FILTER_ID = '20202020-0000-4000-8000-0000000000f1';
const CITY_FILTER_ID = '20202020-0000-4000-8000-0000000000f2';
const EMPLOYEES_FILTER_ID = '20202020-0000-4000-8000-0000000000f3';
const ROOT_FILTER_GROUP_ID = '20202020-0000-4000-8000-0000000000a1';
const CHILD_FILTER_GROUP_ID = '20202020-0000-4000-8000-0000000000a2';

const jobTitleRecordFilter: RecordFilter = {
  id: JOB_TITLE_FILTER_ID,
  fieldMetadataId: jobTitleField.id,
  operand: ViewFilterOperand.CONTAINS,
  value: 'cto',
  displayValue: 'cto',
  type: 'TEXT',
  label: jobTitleField.label,
  recordFilterGroupId: ROOT_FILTER_GROUP_ID,
  positionInRecordFilterGroup: 0,
  subFieldName: null,
  relationTargetFieldMetadataId: null,
};

const cityRecordFilter: RecordFilter = {
  id: CITY_FILTER_ID,
  fieldMetadataId: cityField.id,
  operand: ViewFilterOperand.CONTAINS,
  value: 'Paris',
  displayValue: 'Paris',
  type: 'TEXT',
  label: cityField.label,
  recordFilterGroupId: CHILD_FILTER_GROUP_ID,
  positionInRecordFilterGroup: 1,
  subFieldName: null,
  relationTargetFieldMetadataId: null,
};

const rootRecordFilterGroup: RecordFilterGroup = {
  id: ROOT_FILTER_GROUP_ID,
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
  positionInRecordFilterGroup: 0,
};

const childRecordFilterGroup: RecordFilterGroup = {
  id: CHILD_FILTER_GROUP_ID,
  parentRecordFilterGroupId: ROOT_FILTER_GROUP_ID,
  logicalOperator: RecordFilterGroupLogicalOperator.OR,
  positionInRecordFilterGroup: 1,
};

const RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [
    {
      id: JOB_TITLE_FILTER_ID,
      fieldMetadataId: jobTitleField.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'cto',
      subFieldName: null,
      relationTargetFieldMetadataId: null,
      filterGroupId: ROOT_FILTER_GROUP_ID,
    },
    {
      id: CITY_FILTER_ID,
      fieldMetadataId: nameField.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'Ada',
      subFieldName: 'firstName',
      relationTargetFieldMetadataId: null,
      filterGroupId: CHILD_FILTER_GROUP_ID,
    },
    {
      id: EMPLOYEES_FILTER_ID,
      fieldMetadataId: personCompanyField.id,
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      value: '100',
      subFieldName: null,
      relationTargetFieldMetadataId: companyEmployeesField.id,
      filterGroupId: CHILD_FILTER_GROUP_ID,
    },
  ],
  filterGroups: [
    {
      id: ROOT_FILTER_GROUP_ID,
      parentFilterGroupId: null,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
    },
    {
      id: CHILD_FILTER_GROUP_ID,
      parentFilterGroupId: ROOT_FILTER_GROUP_ID,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
    },
  ],
  sorts: [
    {
      fieldMetadataId: createdAtField.id,
      direction: ViewSortDirection.DESC,
      subFieldName: null,
      relationTargetFieldMetadataId: null,
    },
    {
      fieldMetadataId: nameField.id,
      direction: ViewSortDirection.ASC,
      subFieldName: 'lastName',
      relationTargetFieldMetadataId: null,
    },
  ],
  limit: 3,
};

describe('getRelationScopeFromRecordFiltersAndSorts', () => {
  it('turns record filters into scope filters, keeping their group and value', () => {
    const { filters } = getRelationScopeFromRecordFiltersAndSorts({
      recordFilters: [jobTitleRecordFilter],
      recordFilterGroups: [rootRecordFilterGroup],
      recordSorts: [],
      limit: null,
    });

    expect(filters).toEqual([
      {
        id: JOB_TITLE_FILTER_ID,
        fieldMetadataId: jobTitleField.id,
        operand: ViewFilterOperand.CONTAINS,
        value: 'cto',
        subFieldName: null,
        relationTargetFieldMetadataId: null,
        filterGroupId: ROOT_FILTER_GROUP_ID,
      },
    ]);
  });

  it('orders filters and filter groups by their position', () => {
    const { filters, filterGroups } = getRelationScopeFromRecordFiltersAndSorts(
      {
        recordFilters: [cityRecordFilter, jobTitleRecordFilter],
        recordFilterGroups: [childRecordFilterGroup, rootRecordFilterGroup],
        recordSorts: [],
        limit: null,
      },
    );

    expect(filters.map(({ id }) => id)).toEqual([
      JOB_TITLE_FILTER_ID,
      CITY_FILTER_ID,
    ]);
    expect(filterGroups).toEqual([
      {
        id: ROOT_FILTER_GROUP_ID,
        parentFilterGroupId: null,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
      {
        id: CHILD_FILTER_GROUP_ID,
        parentFilterGroupId: ROOT_FILTER_GROUP_ID,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      },
    ]);
  });

  it('keeps sorts in order, without their local id', () => {
    const recordSorts: RecordSort[] = [
      {
        id: 'second-added',
        fieldMetadataId: createdAtField.id,
        direction: ViewSortDirection.DESC,
      },
      {
        id: 'first-added',
        fieldMetadataId: jobTitleField.id,
        direction: ViewSortDirection.ASC,
      },
    ];

    const { sorts } = getRelationScopeFromRecordFiltersAndSorts({
      recordFilters: [],
      recordFilterGroups: [],
      recordSorts,
      limit: null,
    });

    expect(sorts).toEqual([
      {
        fieldMetadataId: createdAtField.id,
        direction: ViewSortDirection.DESC,
        subFieldName: null,
        relationTargetFieldMetadataId: null,
      },
      {
        fieldMetadataId: jobTitleField.id,
        direction: ViewSortDirection.ASC,
        subFieldName: null,
        relationTargetFieldMetadataId: null,
      },
    ]);
  });

  it('carries the limit, and no limit as null', () => {
    const emptyState = {
      recordFilters: [],
      recordFilterGroups: [],
      recordSorts: [],
    };

    expect(
      getRelationScopeFromRecordFiltersAndSorts({ ...emptyState, limit: 5 })
        .limit,
    ).toBe(5);
    expect(
      getRelationScopeFromRecordFiltersAndSorts({ ...emptyState, limit: null })
        .limit,
    ).toBeNull();
  });

  it('gives back the scope its record filters and sorts came from', () => {
    expect(
      getRelationScopeFromRecordFiltersAndSorts({
        ...getRelationScopeRecordFiltersAndSorts({
          relationScope: RELATION_SCOPE,
          fieldMetadataItems,
        }),
        limit: RELATION_SCOPE.limit ?? null,
      }),
    ).toEqual(RELATION_SCOPE);
  });

  it('gives back the same scope after a second round trip through record filters', () => {
    const recordFiltersAndSorts = getRelationScopeRecordFiltersAndSorts({
      relationScope: RELATION_SCOPE,
      fieldMetadataItems,
    });

    expect(
      getRelationScopeRecordFiltersAndSorts({
        relationScope: getRelationScopeFromRecordFiltersAndSorts({
          ...recordFiltersAndSorts,
          limit: 3,
        }),
        fieldMetadataItems,
      }),
    ).toEqual(recordFiltersAndSorts);
  });
});
