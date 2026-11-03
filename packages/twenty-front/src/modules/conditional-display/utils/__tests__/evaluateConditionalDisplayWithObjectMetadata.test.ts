import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { evaluateConditionalDisplayWithObjectMetadata } from '@/conditional-display/utils/evaluateConditionalDisplayWithObjectMetadata';
import {
  type ConditionalDisplay,
  type ConditionalDisplayContextKey,
  type ConditionalDisplayRecordFilter,
  ContextStorePageType,
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

const ADMIN_ROLE_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ROLE_ID = '20202020-0000-4000-8000-000000000002';
const CURRENT_WORKSPACE_MEMBER_ID = 'current-workspace-member-id';

const buildContext = (
  context: ConditionalDisplayEvaluationContext,
): ConditionalDisplayEvaluationContext => ({
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
  context?: ConditionalDisplayEvaluationContext;
  records?: Record<string, unknown>[];
}) =>
  evaluateConditionalDisplayWithObjectMetadata({
    conditionalDisplay,
    context,
    records,
    objectMetadataItem: companyObjectMetadataItem,
    objectMetadataItems,
  });

describe('evaluateConditionalDisplayWithObjectMetadata', () => {
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
      selectedRecordsMatch: 'SOME',
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
      evaluateConditionalDisplayWithObjectMetadata({
        conditionalDisplay: { recordFilters: [nameContainsAirRecordFilter] },
        context: buildContext({}),
        records: [{ id: 'company-1', name: 'Airbnb' }],
        objectMetadataItems,
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

  describe('engine rows', () => {
    const atLeastOneSelectedRecordFilter: ConditionalDisplayRecordFilter = {
      id: 'selection-filter',
      contextKey: 'numberOfSelectedRecords',
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      value: JSON.stringify(1),
    };

    const featureEnabledRecordFilter: ConditionalDisplayRecordFilter = {
      id: 'feature-flag-filter',
      contextKey: 'featureFlags',
      subFieldName: 'IS_FEATURE_ENABLED',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(true),
    };

    const statusIsSentRecordFilter: ConditionalDisplayRecordFilter = {
      id: 'status-filter',
      contextKey: 'selectedRecords',
      subFieldName: 'status',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify('SENT'),
    };

    it('evaluates command menu context rows', () => {
      const conditionalDisplay: ConditionalDisplay = {
        recordFilters: [
          atLeastOneSelectedRecordFilter,
          {
            id: 'page-type-filter',
            contextKey: 'pageType',
            operand: ViewFilterOperand.IS,
            value: JSON.stringify([ContextStorePageType.Record]),
          },
          {
            id: 'permission-filter',
            contextKey: 'objectPermissions',
            subFieldName: 'canUpdateObjectRecords',
            operand: ViewFilterOperand.IS,
            value: JSON.stringify(true),
          },
          {
            id: 'favorites-filter',
            contextKey: 'areAllSelectedRecordsFavorites',
            operand: ViewFilterOperand.IS,
            value: JSON.stringify(false),
          },
        ],
      };

      const commandMenuContext = buildContext({
        numberOfSelectedRecords: 1,
        pageType: ContextStorePageType.Record,
        objectPermissions: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          objectMetadataId: companyObjectMetadataItem.id,
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
        areAllSelectedRecordsFavorites: false,
      });

      expect(
        evaluateOnCompany({ conditionalDisplay, context: commandMenuContext }),
      ).toBe(true);
      expect(
        evaluateOnCompany({
          conditionalDisplay,
          context: { ...commandMenuContext, numberOfSelectedRecords: 0 },
        }),
      ).toBe(false);
      expect(
        evaluateOnCompany({
          conditionalDisplay,
          context: {
            ...commandMenuContext,
            areAllSelectedRecordsFavorites: true,
          },
        }),
      ).toBe(false);
    });

    it('quantifies selected record rows over the selected records', () => {
      const records = [
        { id: 'campaign-1', status: 'DRAFT' },
        { id: 'campaign-2', status: 'SENT' },
      ];

      expect(
        evaluateOnCompany({
          conditionalDisplay: {
            selectedRecordsMatch: 'SOME',
            recordFilters: [statusIsSentRecordFilter],
          },
          records,
        }),
      ).toBe(true);
      expect(
        evaluateOnCompany({
          conditionalDisplay: { recordFilters: [statusIsSentRecordFilter] },
          records,
        }),
      ).toBe(false);
      expect(
        evaluateOnCompany({
          conditionalDisplay: {
            selectedRecordsMatch: 'SOME',
            recordFilters: [statusIsSentRecordFilter],
          },
          records: [],
        }),
      ).toBe(false);
    });

    it('evaluates widget context rows next to field rows', () => {
      const conditionalDisplay: ConditionalDisplay = {
        recordFilters: [
          featureEnabledRecordFilter,
          statusIsSentRecordFilter,
          nameContainsAirRecordFilter,
        ],
      };

      const widgetContext = buildContext({
        featureFlags: { IS_FEATURE_ENABLED: true },
      });

      expect(
        evaluateOnCompany({
          conditionalDisplay,
          context: widgetContext,
          records: [{ id: 'company-1', name: 'Airbnb', status: 'SENT' }],
        }),
      ).toBe(true);
      expect(
        evaluateOnCompany({
          conditionalDisplay,
          context: buildContext({
            featureFlags: { IS_FEATURE_ENABLED: false },
          }),
          records: [{ id: 'company-1', name: 'Airbnb', status: 'SENT' }],
        }),
      ).toBe(false);
      expect(
        evaluateOnCompany({
          conditionalDisplay,
          context: widgetContext,
          records: [{ id: 'company-1', name: 'Stripe', status: 'SENT' }],
        }),
      ).toBe(false);
    });

    it('hides the item when the context lacks the key of an engine row', () => {
      expect(
        evaluateOnCompany({
          conditionalDisplay: {
            recordFilters: [
              {
                ...atLeastOneSelectedRecordFilter,
                operand: ViewFilterOperand.IS_NOT,
                value: JSON.stringify(0),
              },
            ],
          },
        }),
      ).toBe(false);
      expect(
        evaluateOnCompany({
          conditionalDisplay: {
            recordFilters: [
              {
                ...featureEnabledRecordFilter,
                value: JSON.stringify(false),
              },
            ],
          },
        }),
      ).toBe(false);
    });
  });
});
