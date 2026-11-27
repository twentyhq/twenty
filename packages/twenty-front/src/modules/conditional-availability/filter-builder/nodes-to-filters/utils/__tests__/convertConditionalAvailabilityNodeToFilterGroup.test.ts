import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/filter-builder/filters-to-nodes/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { convertConditionalAvailabilityNodeToFilterGroup } from '@/conditional-availability/filter-builder/nodes-to-filters/utils/convertConditionalAvailabilityNodeToFilterGroup';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import {
  buildDeviceConditionalEvaluationNode,
  type ConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { type ExpressionFieldNode } from 'twenty-shared/expression';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000001';
const OTHER_WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000002';

const comparison = ({
  operator,
  variablePath,
  value,
}: {
  operator: 'EQUAL' | 'NOT_EQUAL';
  variablePath: string;
  value: string;
}): ConditionalEvaluationNode => ({
  type: 'COMPARISON',
  operator,
  left: { type: 'VARIABLE', path: variablePath },
  right: { type: 'LITERAL', value },
});

const roleIs = (roleUniversalIdentifier: string) =>
  comparison({
    operator: 'EQUAL',
    variablePath: 'currentRole.universalIdentifier',
    value: roleUniversalIdentifier,
  });

const workspaceMemberIsNot = (workspaceMemberId: string) =>
  comparison({
    operator: 'NOT_EQUAL',
    variablePath: 'currentWorkspaceMember.id',
    value: workspaceMemberId,
  });

const DEVICE_IS_MOBILE = buildDeviceConditionalEvaluationNode('MOBILE');

const STAGE_FIELD: ExpressionFieldNode = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'stage-universal-identifier',
};

const ACCOUNT_OWNER_FIELD: ExpressionFieldNode = {
  type: 'FIELD',
  relationFieldUniversalIdentifier: 'account-owner-universal-identifier',
  fieldUniversalIdentifier: 'workspace-member-id-universal-identifier',
};

const STAGE_IS_WON = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: STAGE_FIELD,
  right: { type: 'LITERAL', value: 'WON' },
} as const satisfies ConditionalEvaluationNode;

const getFilterGroupOrThrow = (node: ConditionalEvaluationNode) => {
  const filterGroup = convertConditionalAvailabilityNodeToFilterGroup({ node });

  assertIsDefinedOrThrow(filterGroup);

  expect(
    convertConditionalAvailabilityFilterOrGroupToNode({
      filterOrGroup: filterGroup,
    }),
  ).toEqual(node);

  return filterGroup;
};

describe('convertConditionalAvailabilityNodeToFilterGroup', () => {
  it('should read a chain of roles as one filter and a device as another', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [
        {
          type: 'GROUP',
          logicalOperator: 'OR',
          children: [
            roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
            roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
          ],
        },
        DEVICE_IS_MOBILE,
      ],
    });

    expect(filterGroup).toMatchObject({
      logicalOperator: 'AND',
      children: [
        {
          type: 'filter',
          variable: 'currentRole',
          operator: 'isAnyOf',
          values: [
            ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
            SALES_ROLE_UNIVERSAL_IDENTIFIER,
          ],
        },
        {
          type: 'filter',
          variable: 'device',
          operator: 'is',
          values: ['MOBILE'],
        },
      ],
    });
  });

  it('should read one workspace member as "is not" and several as "is none of"', () => {
    expect(
      getFilterGroupOrThrow(workspaceMemberIsNot(WORKSPACE_MEMBER_ID)).children,
    ).toMatchObject([
      {
        type: 'filter',
        variable: 'currentWorkspaceMember',
        operator: 'isNot',
        values: [WORKSPACE_MEMBER_ID],
      },
    ]);

    expect(
      getFilterGroupOrThrow({
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [
          workspaceMemberIsNot(WORKSPACE_MEMBER_ID),
          workspaceMemberIsNot(OTHER_WORKSPACE_MEMBER_ID),
        ],
      }).children,
    ).toMatchObject([
      {
        type: 'filter',
        variable: 'currentWorkspaceMember',
        operator: 'isNoneOf',
        values: [WORKSPACE_MEMBER_ID, OTHER_WORKSPACE_MEMBER_ID],
      },
    ]);
  });

  it('should read a nested group of filters', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [
        roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
        {
          type: 'GROUP',
          logicalOperator: 'OR',
          children: [roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER), DEVICE_IS_MOBILE],
        },
      ],
    });

    expect(filterGroup.children).toMatchObject([
      {
        type: 'filter',
        variable: 'currentRole',
        values: [SALES_ROLE_UNIVERSAL_IDENTIFIER],
      },
      {
        type: 'filterGroup',
        logicalOperator: 'OR',
        children: [
          {
            variable: 'currentRole',
            values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER],
          },
          { variable: 'device', values: ['MOBILE'] },
        ],
      },
    ]);
  });

  it('should keep two devices joined by "or" as two filters', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [
        DEVICE_IS_MOBILE,
        buildDeviceConditionalEvaluationNode('DESKTOP'),
      ],
    });

    expect(filterGroup.children).toMatchObject([
      { variable: 'device', operator: 'is', values: ['MOBILE'] },
      { variable: 'device', operator: 'is', values: ['DESKTOP'] },
    ]);
  });

  it('should keep two roles joined by "and" as two filters', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [
        roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
        roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
      ],
    });

    expect(filterGroup.children).toMatchObject([
      { variable: 'currentRole', values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER] },
      { variable: 'currentRole', values: [SALES_ROLE_UNIVERSAL_IDENTIFIER] },
    ]);
  });

  it('should keep the same value twice as two filters', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [
        roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
        roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
      ],
    });

    expect(filterGroup.children).toMatchObject([
      { variable: 'currentRole', values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER] },
      { variable: 'currentRole', values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER] },
    ]);
  });

  it('should read several values of a record field as one "is any of" filter', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [
        { ...STAGE_IS_WON },
        { ...STAGE_IS_WON, right: { type: 'LITERAL', value: 'LOST' } },
      ],
    });

    expect(filterGroup.children).toMatchObject([
      {
        type: 'filter',
        field: STAGE_FIELD,
        operator: 'isAnyOf',
        values: ['WON', 'LOST'],
      },
    ]);
  });

  it('should read a record field compared with the current workspace member as "Me"', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'COMPARISON',
      operator: 'NOT_EQUAL',
      left: ACCOUNT_OWNER_FIELD,
      right: { type: 'VARIABLE', path: 'currentWorkspaceMember.id' },
    });

    expect(filterGroup.children).toMatchObject([
      {
        type: 'filter',
        field: ACCOUNT_OWNER_FIELD,
        operator: 'isNot',
        values: [CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID],
      },
    ]);
  });

  it('should keep two record fields as two filters', () => {
    const filterGroup = getFilterGroupOrThrow({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [
        { ...STAGE_IS_WON, left: ACCOUNT_OWNER_FIELD },
        { ...STAGE_IS_WON, right: { type: 'LITERAL', value: 'LOST' } },
      ],
    });

    expect(filterGroup.children).toMatchObject([
      { field: ACCOUNT_OWNER_FIELD, operator: 'is', values: ['WON'] },
      { field: STAGE_FIELD, operator: 'is', values: ['LOST'] },
    ]);
  });

  it('should read a record field compared with a number, keeping the number', () => {
    const filterGroup = getFilterGroupOrThrow({
      ...STAGE_IS_WON,
      operator: 'GREATER_THAN_OR_EQUAL',
      right: { type: 'LITERAL', value: 500 },
    });

    expect(filterGroup.children).toMatchObject([
      { field: STAGE_FIELD, operator: 'greaterThanOrEqual', values: [500] },
    ]);
  });

  it('should read a record field compared with false', () => {
    const filterGroup = getFilterGroupOrThrow({
      ...STAGE_IS_WON,
      right: { type: 'LITERAL', value: false },
    });

    expect(filterGroup.children).toMatchObject([
      { field: STAGE_FIELD, operator: 'is', values: [false] },
    ]);
  });

  it.each<{ title: string; node: ConditionalEvaluationNode }>([
    {
      title: 'a record field compared with an empty text',
      node: { ...STAGE_IS_WON, right: { type: 'LITERAL', value: '' } },
    },
    {
      title: 'a record field compared with another variable',
      node: { ...STAGE_IS_WON, right: { type: 'VARIABLE', path: 'device' } },
    },
    {
      title: 'a record field compared with an order operator',
      node: { ...STAGE_IS_WON, operator: 'GREATER_THAN' },
    },
    {
      title: 'a third level of groups',
      node: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [
          DEVICE_IS_MOBILE,
          {
            type: 'GROUP',
            logicalOperator: 'OR',
            children: [
              roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
              {
                type: 'GROUP',
                logicalOperator: 'AND',
                children: [
                  DEVICE_IS_MOBILE,
                  roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
                ],
              },
            ],
          },
        ],
      },
    },
    {
      title: 'a negation',
      node: { type: 'NOT', child: DEVICE_IS_MOBILE },
    },
    {
      title: 'a device that is not a device',
      node: comparison({
        operator: 'EQUAL',
        variablePath: 'device',
        value: 'TABLET',
      }),
    },
    {
      title: 'a device excluded',
      node: comparison({
        operator: 'NOT_EQUAL',
        variablePath: 'device',
        value: 'MOBILE',
      }),
    },
    {
      title: 'a comparison other than "equal" or "not equal"',
      node: {
        type: 'COMPARISON',
        operator: 'GREATER_THAN',
        left: { type: 'VARIABLE', path: 'currentRole.universalIdentifier' },
        right: { type: 'LITERAL', value: ADMIN_ROLE_UNIVERSAL_IDENTIFIER },
      },
    },
    {
      title: 'a variable the builder has no filter for',
      node: comparison({
        operator: 'EQUAL',
        variablePath: 'featureFlags.IS_AI_ENABLED',
        value: 'true',
      }),
    },
  ])('should not read $title as filters', ({ node }) => {
    expect(
      convertConditionalAvailabilityNodeToFilterGroup({ node }),
    ).toBeNull();
  });
});
