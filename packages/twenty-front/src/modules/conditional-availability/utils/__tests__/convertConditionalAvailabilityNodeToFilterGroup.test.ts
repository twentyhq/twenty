import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { convertConditionalAvailabilityNodeToFilterGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToFilterGroup';
import {
  buildDeviceConditionalAvailability,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
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
}): ConditionalAvailabilityNode => ({
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

const DEVICE_IS_MOBILE = buildDeviceConditionalAvailability('MOBILE');

const getFilterGroupOrThrow = (node: ConditionalAvailabilityNode) => {
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
          operator: 'EQUAL',
          values: [
            ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
            SALES_ROLE_UNIVERSAL_IDENTIFIER,
          ],
        },
        {
          type: 'filter',
          variable: 'device',
          operator: 'EQUAL',
          values: ['MOBILE'],
        },
      ],
    });
  });

  it('should read excluded workspace members as one filter', () => {
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
        operator: 'NOT_EQUAL',
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

  it.each<{ title: string; node: ConditionalAvailabilityNode }>([
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
