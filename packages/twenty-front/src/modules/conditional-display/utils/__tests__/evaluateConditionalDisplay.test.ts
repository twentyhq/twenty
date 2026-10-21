import { type ConditionalDisplayContext } from '@/conditional-display/types/ConditionalDisplayContext';
import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import {
  type ConditionalDisplay,
  type ConditionalDisplayContextKey,
  type ConditionalDisplayRecordFilter,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const companyObjectMetadataItem = objectMetadataItems.find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'company',
)!;

const getCompanyFieldMetadataId = (fieldName: string) =>
  companyObjectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
  )!.id;

const ADMIN_ROLE_ID = 'admin-role-id';
const MEMBER_ROLE_ID = 'member-role-id';
const CURRENT_WORKSPACE_MEMBER_ID = 'current-workspace-member-id';

const buildContext = (
  context: ConditionalDisplayContext,
): ConditionalDisplayContext => ({
  currentRoleId: ADMIN_ROLE_ID,
  currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
  device: 'DESKTOP',
  ...context,
});

const roleIsAdminRecordFilter: ConditionalDisplayRecordFilter = {
  id: 'role-filter',
  contextKey: 'currentRoleId',
  operand: ViewFilterOperand.IS,
  value: JSON.stringify([ADMIN_ROLE_ID]),
};

const nameContainsAirRecordFilter: ConditionalDisplayRecordFilter = {
  id: 'name-filter',
  fieldMetadataId: getCompanyFieldMetadataId('name'),
  operand: ViewFilterOperand.CONTAINS,
  value: 'Air',
};

const employeesAtLeastFiftyRecordFilter: ConditionalDisplayRecordFilter = {
  id: 'employees-filter',
  fieldMetadataId: getCompanyFieldMetadataId('employees'),
  operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  value: '50',
};

const evaluateOnCompany = ({
  conditionalDisplay,
  context = buildContext({}),
  records = [],
}: {
  conditionalDisplay: ConditionalDisplay | null;
  context?: ConditionalDisplayContext;
  records?: Record<string, unknown>[];
}) =>
  evaluateConditionalDisplay({
    conditionalDisplay,
    context,
    records,
    objectMetadataItem: companyObjectMetadataItem,
    objectMetadataItems,
  });

describe('evaluateConditionalDisplay', () => {
  it('shows the item when there is no rule', () => {
    expect(evaluateOnCompany({ conditionalDisplay: null })).toBe(true);
    expect(
      evaluateOnCompany({ conditionalDisplay: { recordFilters: [] } }),
    ).toBe(true);
  });

  it('shows the item only to the selected roles', () => {
    const conditionalDisplay = { recordFilters: [roleIsAdminRecordFilter] };

    expect(evaluateOnCompany({ conditionalDisplay })).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ currentRoleId: MEMBER_ROLE_ID }),
      }),
    ).toBe(false);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ currentRoleId: null }),
      }),
    ).toBe(false);
  });

  it('matches the current workspace member when "Me" is selected', () => {
    const conditionalDisplay = {
      recordFilters: [
        {
          id: 'member-filter',
          contextKey: 'currentWorkspaceMemberId' as const,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          }),
        },
      ],
    };

    expect(evaluateOnCompany({ conditionalDisplay })).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ currentWorkspaceMemberId: null }),
      }),
    ).toBe(false);
  });

  it('shows the item only on the selected device', () => {
    const conditionalDisplay = {
      recordFilters: [
        {
          id: 'device-filter',
          contextKey: 'device' as const,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(['MOBILE']),
        },
      ],
    };

    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ device: 'MOBILE' }),
      }),
    ).toBe(true);
    expect(evaluateOnCompany({ conditionalDisplay })).toBe(false);
  });

  it('keeps an OR with a context leaf alive when no record is selected', () => {
    const conditionalDisplay: ConditionalDisplay = {
      recordFilterGroups: [
        { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.OR },
      ],
      recordFilters: [
        { ...roleIsAdminRecordFilter, recordFilterGroupId: 'root' },
        { ...nameContainsAirRecordFilter, recordFilterGroupId: 'root' },
      ],
    };

    expect(evaluateOnCompany({ conditionalDisplay, records: [] })).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ currentRoleId: MEMBER_ROLE_ID }),
        records: [],
      }),
    ).toBe(false);
  });

  it('evaluates record leaves as false when no record is selected', () => {
    expect(
      evaluateOnCompany({
        conditionalDisplay: { recordFilters: [nameContainsAirRecordFilter] },
        records: [],
      }),
    ).toBe(false);
  });

  it('requires one record to satisfy every leaf with SOME', () => {
    const conditionalDisplay: ConditionalDisplay = {
      quantifier: 'SOME',
      recordFilters: [
        nameContainsAirRecordFilter,
        employeesAtLeastFiftyRecordFilter,
      ],
    };

    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [
          { id: 'company-1', name: 'Airbnb', employees: 10 },
          { id: 'company-2', name: 'Stripe', employees: 100 },
        ],
      }),
    ).toBe(false);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [
          { id: 'company-1', name: 'Airbnb', employees: 100 },
          { id: 'company-2', name: 'Stripe', employees: 10 },
        ],
      }),
    ).toBe(true);
  });

  it('requires every record to match by default', () => {
    const conditionalDisplay = { recordFilters: [nameContainsAirRecordFilter] };

    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [
          { id: 'company-1', name: 'Airbnb' },
          { id: 'company-2', name: 'Airtable' },
        ],
      }),
    ).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [
          { id: 'company-1', name: 'Airbnb' },
          { id: 'company-2', name: 'Stripe' },
        ],
      }),
    ).toBe(false);
  });

  it('hides the item when a leaf targets a deleted field', () => {
    expect(
      evaluateOnCompany({
        conditionalDisplay: {
          recordFilters: [
            {
              ...nameContainsAirRecordFilter,
              fieldMetadataId: 'deleted-field',
            },
          ],
        },
        records: [{ id: 'company-1', name: 'Airbnb' }],
      }),
    ).toBe(false);
  });

  it('hides the item when a leaf uses an unknown context key', () => {
    expect(
      evaluateOnCompany({
        conditionalDisplay: {
          recordFilters: [
            {
              ...roleIsAdminRecordFilter,
              contextKey: 'unknownKey' as ConditionalDisplayContextKey,
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it('hides the item when a record leaf has no object to evaluate against', () => {
    expect(
      evaluateConditionalDisplay({
        conditionalDisplay: { recordFilters: [nameContainsAirRecordFilter] },
        context: buildContext({}),
        records: [{ id: 'company-1', name: 'Airbnb' }],
        objectMetadataItems,
      }),
    ).toBe(false);
  });

  it('hides the item when a leaf points at an unknown group', () => {
    expect(
      evaluateOnCompany({
        conditionalDisplay: {
          recordFilterGroups: [
            {
              id: 'root',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
          ],
          recordFilters: [
            { ...roleIsAdminRecordFilter, recordFilterGroupId: 'root' },
            {
              ...roleIsAdminRecordFilter,
              id: 'orphan-filter',
              value: JSON.stringify([MEMBER_ROLE_ID]),
              recordFilterGroupId: 'deleted-group',
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it('hides the item when a group points at an unknown parent group', () => {
    expect(
      evaluateOnCompany({
        conditionalDisplay: {
          recordFilterGroups: [
            {
              id: 'child',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
              parentRecordFilterGroupId: 'deleted-group',
            },
          ],
          recordFilters: [
            { ...roleIsAdminRecordFilter, recordFilterGroupId: 'child' },
          ],
        },
      }),
    ).toBe(false);
  });

  it('evaluates a nested OR group inside an AND root', () => {
    const conditionalDisplay: ConditionalDisplay = {
      recordFilterGroups: [
        { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
        {
          id: 'nested',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'root',
        },
      ],
      recordFilters: [
        { ...roleIsAdminRecordFilter, recordFilterGroupId: 'root' },
        { ...nameContainsAirRecordFilter, recordFilterGroupId: 'nested' },
        { ...employeesAtLeastFiftyRecordFilter, recordFilterGroupId: 'nested' },
      ],
    };

    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [{ id: 'company-1', name: 'Stripe', employees: 100 }],
      }),
    ).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [{ id: 'company-1', name: 'Stripe', employees: 10 }],
      }),
    ).toBe(false);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        context: buildContext({ currentRoleId: MEMBER_ROLE_ID }),
        records: [{ id: 'company-1', name: 'Airbnb', employees: 100 }],
      }),
    ).toBe(false);
  });

  it('matches IS_EMPTY when the record has no value for the field', () => {
    const conditionalDisplay = {
      recordFilters: [
        {
          ...employeesAtLeastFiftyRecordFilter,
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        },
      ],
    };

    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [{ id: 'company-1', name: 'Airbnb', employees: null }],
      }),
    ).toBe(true);
    expect(
      evaluateOnCompany({
        conditionalDisplay,
        records: [{ id: 'company-1', name: 'Airbnb', employees: 10 }],
      }),
    ).toBe(false);
  });
});
