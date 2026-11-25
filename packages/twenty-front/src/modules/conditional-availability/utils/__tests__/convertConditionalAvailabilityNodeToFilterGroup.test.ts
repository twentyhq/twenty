import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { convertConditionalAvailabilityNodeToFilterGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToFilterGroup';
import {
  buildDeviceConditionalAvailability,
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000001';
const OTHER_WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000002';

const group = (
  logicalOperator: ConditionalAvailabilityLogicalOperator,
  children: ConditionalAvailabilityNode[],
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator,
  children,
});

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

const convertToFilterGroup = (node: ConditionalAvailabilityNode) =>
  convertConditionalAvailabilityNodeToFilterGroup({
    node,
    metadataName: 'pageLayoutWidget',
  });

const getFilterGroupOrThrow = (node: ConditionalAvailabilityNode) => {
  const filterGroup = convertToFilterGroup(node);

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
    const filterGroup = getFilterGroupOrThrow(
      group('AND', [
        group('OR', [
          roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
          roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
        ]),
        DEVICE_IS_MOBILE,
      ]),
    );

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
      getFilterGroupOrThrow(
        group('AND', [
          workspaceMemberIsNot(WORKSPACE_MEMBER_ID),
          workspaceMemberIsNot(OTHER_WORKSPACE_MEMBER_ID),
        ]),
      ).children,
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
    const filterGroup = getFilterGroupOrThrow(
      group('AND', [
        roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
        group('OR', [
          roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
          DEVICE_IS_MOBILE,
        ]),
      ]),
    );

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
    const filterGroup = getFilterGroupOrThrow(
      group('OR', [
        DEVICE_IS_MOBILE,
        buildDeviceConditionalAvailability('DESKTOP'),
      ]),
    );

    expect(filterGroup).toMatchObject({
      logicalOperator: 'OR',
      children: [
        { type: 'filter', variable: 'device', values: ['MOBILE'] },
        { type: 'filter', variable: 'device', values: ['DESKTOP'] },
      ],
    });
  });

  it.each([
    {
      title: 'a third level of groups',
      node: group('AND', [
        DEVICE_IS_MOBILE,
        group('OR', [
          roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
          group('AND', [
            DEVICE_IS_MOBILE,
            roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
          ]),
        ]),
      ]),
    },
    {
      title: 'a negation',
      node: { type: 'NOT' as const, child: DEVICE_IS_MOBILE },
    },
    {
      title: 'the same role twice',
      node: group('OR', [
        roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
        roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
      ]),
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
        ...roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
        operator: 'GREATER_THAN' as const,
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
    expect(convertToFilterGroup(node)).toBeNull();
  });
});
