import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { buildConditionalAvailabilityNode } from '@/conditional-availability/utils/buildConditionalAvailabilityNode';
import { getConditionalAvailabilityEditorStateFromNode } from '@/conditional-availability/utils/getConditionalAvailabilityEditorStateFromNode';
import {
  type CompositeFieldSubFieldName,
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
  type ConditionalAvailabilityRecordQuantifier,
  RecordFilterOperand,
} from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const ADMIN = '20202020-0000-4000-8000-000000000001';
const SALES = '20202020-0000-4000-8000-000000000002';
const MEMBER_ID = '20202020-1111-4000-8000-000000000001';
const OTHER_MEMBER_ID = '20202020-1111-4000-8000-000000000002';

const group = (
  logicalOperator: ConditionalAvailabilityLogicalOperator,
  children: ConditionalAvailabilityNode[],
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator,
  children,
});

const comparison = (
  operator: 'EQUAL' | 'NOT_EQUAL',
  path: string,
  value: string,
): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator,
  left: { type: 'PATH', path },
  right: { type: 'LITERAL', value },
});

const roleIs = (role: string) =>
  comparison('EQUAL', 'currentRole.universalIdentifier', role);
const memberIsNot = (memberId: string) =>
  comparison('NOT_EQUAL', 'currentWorkspaceMember.id', memberId);
const MOBILE = comparison('EQUAL', 'device', 'MOBILE');

const recordFilter = ({
  objectNameSingular = 'company',
  fieldName,
  subFieldName = null,
  operand,
  value = '',
  quantifier = 'EVERY',
}: {
  objectNameSingular?: string;
  fieldName: string;
  subFieldName?: CompositeFieldSubFieldName | null;
  operand: RecordFilterOperand;
  value?: string;
  quantifier?: ConditionalAvailabilityRecordQuantifier;
}): ConditionalAvailabilityNode => ({
  type: 'SELECTED_RECORDS',
  quantifier,
  recordFilter: {
    fieldMetadataUniversalIdentifier: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow(objectNameSingular),
      fieldName,
    }).universalIdentifier,
    subFieldName,
    operand,
    value,
  },
});

const read = ({
  node,
  objectNameSingular = 'company',
}: {
  node: ConditionalAvailabilityNode | null;
  objectNameSingular?: string;
}) =>
  getConditionalAvailabilityEditorStateFromNode({
    node,
    metadataName: 'pageLayoutWidget',
    fields: getMockObjectMetadataItemOrThrow(objectNameSingular).fields,
  });

const readTree = (
  parameters: Parameters<typeof read>[0] & {
    node: ConditionalAvailabilityNode;
  },
) => {
  const result = read(parameters);

  if (result.mode !== 'customRule') {
    throw new Error(`The rule was read as ${result.mode}`);
  }

  expect(buildConditionalAvailabilityNode({ tree: result.tree })).toEqual(
    parameters.node,
  );

  return result.tree;
};

describe('getConditionalAvailabilityEditorStateFromNode', () => {
  it('should read no rule as everyone', () => {
    expect(read({ node: null })).toEqual({ mode: 'everyone' });
  });

  it('should read a chain of roles as one row and a device as another', () => {
    const tree = readTree({
      node: group('AND', [group('OR', [roleIs(ADMIN), roleIs(SALES)]), MOBILE]),
    });

    expect(tree).toMatchObject({
      logicalOperator: 'AND',
      children: [
        {
          type: 'row',
          row: { subject: 'role', operator: 'isAnyOf', values: [ADMIN, SALES] },
        },
        {
          type: 'row',
          row: { subject: 'device', operator: 'is', values: ['MOBILE'] },
        },
      ],
    });
  });

  it('should read one workspace member as "is not" and several as "is none of"', () => {
    expect(readTree({ node: memberIsNot(MEMBER_ID) }).children).toMatchObject([
      {
        type: 'row',
        row: {
          subject: 'workspaceMember',
          operator: 'isNot',
          values: [MEMBER_ID],
        },
      },
    ]);

    expect(
      readTree({
        node: group('AND', [
          memberIsNot(MEMBER_ID),
          memberIsNot(OTHER_MEMBER_ID),
        ]),
      }).children,
    ).toMatchObject([
      {
        type: 'row',
        row: {
          subject: 'workspaceMember',
          operator: 'isNoneOf',
          values: [MEMBER_ID, OTHER_MEMBER_ID],
        },
      },
    ]);
  });

  it('should read a nested group of rows', () => {
    const tree = readTree({
      node: group('AND', [roleIs(SALES), group('OR', [roleIs(ADMIN), MOBILE])]),
    });

    expect(tree.children).toMatchObject([
      { type: 'row', row: { subject: 'role', values: [SALES] } },
      {
        type: 'group',
        group: {
          logicalOperator: 'OR',
          rows: [
            { subject: 'role', values: [ADMIN] },
            { subject: 'device', values: ['MOBILE'] },
          ],
        },
      },
    ]);
  });

  it('should keep two record filters on one field as two rows', () => {
    const tree = readTree({
      node: group('OR', [
        recordFilter({
          fieldName: 'name',
          operand: RecordFilterOperand.CONTAINS,
          value: 'Acme',
        }),
        recordFilter({
          fieldName: 'name',
          operand: RecordFilterOperand.CONTAINS,
          value: 'Globex',
        }),
      ]),
    });

    expect(tree.children).toHaveLength(2);
  });

  it.each([
    {
      title: 'a text',
      filter: {
        fieldName: 'name',
        operand: RecordFilterOperand.CONTAINS,
        value: 'Acme',
      },
      row: { fieldKind: 'text', operator: 'contains', values: ['Acme'] },
    },
    {
      title: 'a number',
      filter: {
        fieldName: 'employees',
        operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '50',
      },
      row: { fieldKind: 'number', operator: 'atLeast', values: ['50'] },
    },
    {
      title: 'a currency amount in units',
      filter: {
        fieldName: 'annualRecurringRevenue',
        subFieldName: 'amountMicros' as const,
        operand: RecordFilterOperand.LESS_THAN_OR_EQUAL,
        value: '1500.5',
      },
      row: {
        fieldKind: 'currencyAmount',
        operator: 'atMost',
        values: ['1500.5'],
      },
    },
    {
      title: 'a boolean',
      filter: {
        fieldName: 'idealCustomerProfile',
        operand: RecordFilterOperand.IS,
        value: 'true',
      },
      row: { fieldKind: 'boolean', operator: 'is', values: ['true'] },
    },
    {
      title: 'a multi select',
      filter: {
        fieldName: 'workPolicy',
        operand: RecordFilterOperand.CONTAINS,
        value: '["REMOTE_WORK","HYBRID"]',
      },
      row: {
        fieldKind: 'multiSelect',
        operator: 'contains',
        values: ['REMOTE_WORK', 'HYBRID'],
      },
    },
    {
      title: 'a select',
      filter: {
        objectNameSingular: 'opportunity',
        fieldName: 'stage',
        operand: RecordFilterOperand.IS_NOT,
        value: '["NEW"]',
      },
      row: { fieldKind: 'select', operator: 'isNoneOf', values: ['NEW'] },
    },
    {
      title: 'the day of a date and time',
      filter: {
        fieldName: 'createdAt',
        operand: RecordFilterOperand.IS,
        value: '2026-01-15',
      },
      row: { fieldKind: 'dateTime', operator: 'is', values: ['2026-01-15'] },
    },
    {
      title: 'a date and time before the start of a day',
      filter: {
        fieldName: 'createdAt',
        operand: RecordFilterOperand.IS_BEFORE,
        value: '2026-01-15T00:00:00.000Z',
      },
      row: {
        fieldKind: 'dateTime',
        operator: 'before',
        values: ['2026-01-15'],
      },
    },
    {
      title: 'a date and time in the past',
      filter: {
        fieldName: 'createdAt',
        operand: RecordFilterOperand.IS_IN_PAST,
      },
      row: { fieldKind: 'dateTime', operator: 'isInPast', values: [] },
    },
    {
      title: 'a workspace member relation on the current member',
      filter: {
        fieldName: 'accountOwner',
        operand: RecordFilterOperand.IS,
        value:
          '{"isCurrentWorkspaceMemberSelected":true,"selectedRecordIds":[]}',
      },
      row: {
        fieldKind: 'workspaceMemberRelation',
        operator: 'is',
        values: [
          CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE,
        ],
      },
    },
    {
      title: 'a workspace member relation on several members',
      filter: {
        fieldName: 'accountOwner',
        operand: RecordFilterOperand.IS_NOT,
        value: `{"isCurrentWorkspaceMemberSelected":false,"selectedRecordIds":["${MEMBER_ID}","${OTHER_MEMBER_ID}"]}`,
      },
      row: {
        fieldKind: 'workspaceMemberRelation',
        operator: 'isNoneOf',
        values: [MEMBER_ID, OTHER_MEMBER_ID],
      },
    },
    {
      title: 'a record relation',
      filter: {
        objectNameSingular: 'opportunity',
        fieldName: 'company',
        operand: RecordFilterOperand.IS,
        value: `{"isCurrentWorkspaceMemberSelected":false,"selectedRecordIds":["${MEMBER_ID}"]}`,
      },
      row: { fieldKind: 'recordRelation', operator: 'is', values: [MEMBER_ID] },
    },
    {
      title: 'an empty field',
      filter: { fieldName: 'tagline', operand: RecordFilterOperand.IS_EMPTY },
      row: { fieldKind: 'text', operator: 'isEmpty', values: [] },
    },
  ])('should read a record filter on $title as a row', ({ filter, row }) => {
    const tree = readTree({
      node: recordFilter(filter),
      objectNameSingular: filter.objectNameSingular,
    });

    expect(tree.children).toMatchObject([
      { type: 'row', row: { subject: 'recordField', ...row } },
    ]);
  });

  it.each([
    {
      title: 'a third level of groups',
      node: group('AND', [
        MOBILE,
        group('OR', [roleIs(ADMIN), group('AND', [MOBILE, roleIs(SALES)])]),
      ]),
    },
    { title: 'a negation', node: { type: 'NOT' as const, child: MOBILE } },
    {
      title: 'the same role twice',
      node: group('OR', [roleIs(ADMIN), roleIs(ADMIN)]),
    },
    {
      title: 'a device that is not a device',
      node: comparison('EQUAL', 'device', 'TABLET'),
    },
    {
      title: 'a device excluded',
      node: comparison('NOT_EQUAL', 'device', 'MOBILE'),
    },
    {
      title: 'a variable the builder has no row for',
      node: comparison('EQUAL', 'featureFlags.IS_AI_ENABLED', 'true'),
    },
    {
      title: 'a field that no longer exists',
      node: {
        type: 'SELECTED_RECORDS' as const,
        quantifier: 'EVERY' as const,
        recordFilter: {
          fieldMetadataUniversalIdentifier: ADMIN,
          subFieldName: null,
          operand: RecordFilterOperand.IS,
          value: 'a',
        },
      },
    },
    {
      title: 'a number that is not a number',
      node: recordFilter({
        fieldName: 'employees',
        operand: RecordFilterOperand.IS,
        value: 'many',
      }),
    },
    {
      title: 'an operand the field kind does not offer',
      node: recordFilter({
        fieldName: 'employees',
        operand: RecordFilterOperand.CONTAINS,
        value: '5',
      }),
    },
    {
      title: 'an exact match on a text sub field',
      node: recordFilter({
        fieldName: 'address',
        subFieldName: 'addressCity',
        operand: RecordFilterOperand.IS,
        value: 'Paris',
      }),
    },
    {
      title: 'a date and time bound that is not the start of a day',
      node: recordFilter({
        fieldName: 'createdAt',
        operand: RecordFilterOperand.IS_BEFORE,
        value: '2026-01-15',
      }),
    },
    {
      title: 'a value on an operand that takes none',
      node: recordFilter({
        fieldName: 'tagline',
        operand: RecordFilterOperand.IS_EMPTY,
        value: 'a',
      }),
    },
    {
      title: 'a select list that names an option twice',
      node: recordFilter({
        fieldName: 'workPolicy',
        operand: RecordFilterOperand.CONTAINS,
        value: '["HYBRID","HYBRID"]',
      }),
    },
    {
      title: 'a filter on some of the selected records',
      node: recordFilter({
        fieldName: 'name',
        operand: RecordFilterOperand.CONTAINS,
        value: 'Acme',
        quantifier: 'SOME',
      }),
    },
  ])('should not read $title as rows', ({ node }) => {
    expect(read({ node })).toEqual({ mode: 'unsupportedRule' });
  });

  it('should not read a record filter as rows without the fields of the object', () => {
    expect(
      getConditionalAvailabilityEditorStateFromNode({
        node: recordFilter({
          fieldName: 'name',
          operand: RecordFilterOperand.CONTAINS,
          value: 'Acme',
        }),
        metadataName: 'pageLayoutWidget',
        fields: [],
      }),
    ).toEqual({ mode: 'unsupportedRule' });
  });
});
