import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const getFieldByNameOrThrow = (fieldName: string) => {
  const field = companyObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected the company mock to have a ${fieldName} field`);
  }

  return field;
};

const nameField = getFieldByNameOrThrow('name');
const createdAtField = getFieldByNameOrThrow('createdAt');
const employeesField = getFieldByNameOrThrow('employees');

const rootGroup: RecordFilterGroup = {
  id: 'root-group',
  logicalOperator: RecordFilterGroupLogicalOperator.OR,
};

const groupedNameFilter: RecordFilter = {
  id: 'name-filter',
  fieldMetadataId: nameField.id,
  type: 'TEXT',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
  displayValue: 'Acme',
  label: 'Name',
  recordFilterGroupId: rootGroup.id,
  positionInRecordFilterGroup: 0,
};

const groupedEmployeesFilter: RecordFilter = {
  id: 'employees-filter',
  fieldMetadataId: employeesField.id,
  type: 'NUMBER',
  operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  value: '10',
  displayValue: '10',
  label: 'Employees',
  recordFilterGroupId: rootGroup.id,
  positionInRecordFilterGroup: 1,
};

// Shaped like a merged dashboard filter: ungrouped, so it sits at the root next to the chart's own group.
const parentlessCreatedAtFilter: RecordFilter = {
  id: 'dashboard-filter-date',
  fieldMetadataId: createdAtField.id,
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_RELATIVE,
  value: 'THIS_1_MONTH',
  displayValue: 'This month',
  label: 'Date',
};

const accountOwnerField = getFieldByNameOrThrow('accountOwner');

// A relation-traversal binding targets a field on the related object, which the view URL cannot name.
const relationTraversalFilter: RecordFilter = {
  id: 'dashboard-filter-owner-email',
  fieldMetadataId: accountOwnerField.id,
  type: 'RELATION',
  operand: ViewFilterOperand.CONTAINS,
  value: 'acme.com',
  displayValue: 'acme.com',
  label: 'Owner email',
  relationTargetFieldMetadataId: 'owner-email-field-id',
};

const groupedRelationTraversalFilter: RecordFilter = {
  ...relationTraversalFilter,
  id: 'grouped-owner-email-filter',
  recordFilterGroupId: rootGroup.id,
  positionInRecordFilterGroup: 2,
};

describe('buildFilterQueryParams', () => {
  it('leaves out filters that traverse a relation, grouped or not', () => {
    const params = buildFilterQueryParams({
      recordFilters: [
        groupedNameFilter,
        groupedRelationTraversalFilter,
        parentlessCreatedAtFilter,
        relationTraversalFilter,
      ],
      recordFilterGroups: [rootGroup],
      objectMetadataItem: companyObjectMetadataItem,
    });

    expect(params.get('filterGroup[filters][0][field]')).toBe('name');
    expect(params.has('filterGroup[filters][1][field]')).toBe(false);
    expect(params.get('filter[createdAt][IS_RELATIVE]')).toBe('THIS_1_MONTH');
    expect(
      Array.from(params.keys()).some((key) => key.includes('accountOwner')),
    ).toBe(false);
  });

  it('emits the root group as filterGroup params when the chart only has grouped filters', () => {
    const params = buildFilterQueryParams({
      recordFilters: [groupedNameFilter, groupedEmployeesFilter],
      recordFilterGroups: [rootGroup],
      objectMetadataItem: companyObjectMetadataItem,
    });

    expect(params.get('filterGroup[operator]')).toBe('OR');
    expect(params.get('filterGroup[filters][0][field]')).toBe('name');
    expect(params.get('filterGroup[filters][0][op]')).toBe('CONTAINS');
    expect(params.get('filterGroup[filters][0][value]')).toBe('Acme');
    expect(params.get('filterGroup[filters][1][field]')).toBe('employees');
    expect(
      Array.from(params.keys()).filter((key) => key.startsWith('filter[')),
    ).toEqual([]);
  });

  it('emits parentless filters as filter params when the chart has no group', () => {
    const params = buildFilterQueryParams({
      recordFilters: [parentlessCreatedAtFilter],
      recordFilterGroups: [],
      objectMetadataItem: companyObjectMetadataItem,
    });

    expect(params.get('filter[createdAt][IS_RELATIVE]')).toBe('THIS_1_MONTH');
    expect(params.has('filterGroup[operator]')).toBe(false);
  });

  it('emits both the root group and the parentless filters when the chart has both', () => {
    const params = buildFilterQueryParams({
      recordFilters: [
        groupedNameFilter,
        groupedEmployeesFilter,
        parentlessCreatedAtFilter,
      ],
      recordFilterGroups: [rootGroup],
      objectMetadataItem: companyObjectMetadataItem,
    });

    expect(params.get('filterGroup[operator]')).toBe('OR');
    expect(params.get('filterGroup[filters][0][field]')).toBe('name');
    expect(params.get('filterGroup[filters][1][field]')).toBe('employees');
    expect(params.has('filterGroup[filters][2][field]')).toBe(false);
    expect(params.get('filter[createdAt][IS_RELATIVE]')).toBe('THIS_1_MONTH');
  });

  it('returns no params when the chart has no filters', () => {
    const params = buildFilterQueryParams({
      objectMetadataItem: companyObjectMetadataItem,
    });

    expect(params.toString()).toBe('');
  });
});
