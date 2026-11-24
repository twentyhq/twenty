import { convertConditionalAvailabilityRowOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityRowOrGroupToNode';
import { getConditionalAvailabilityEditorStateFromNode } from '@/conditional-availability/utils/getConditionalAvailabilityEditorStateFromNode';
import {
  buildDeviceConditionalAvailability,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000001';
const OTHER_WORKSPACE_MEMBER_ID = '20202020-1111-4000-8000-000000000002';

const and = (
  children: ConditionalAvailabilityNode[],
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator: 'AND',
  children,
});

const or = (
  children: ConditionalAvailabilityNode[],
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator: 'OR',
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

const getEditorState = (node: ConditionalAvailabilityNode | null) =>
  getConditionalAvailabilityEditorStateFromNode({
    node,
    metadataName: 'pageLayoutWidget',
  });

const getRowTreeOrThrow = (node: ConditionalAvailabilityNode) => {
  const editorState = getEditorState(node);
  const rowTree =
    editorState.mode === 'customRule' ? editorState.rowTree : undefined;

  assertIsDefinedOrThrow(rowTree);

  expect(
    convertConditionalAvailabilityRowOrGroupToNode({ rowOrGroup: rowTree }),
  ).toEqual(node);

  return rowTree;
};

describe('getConditionalAvailabilityEditorStateFromNode', () => {
  it('should read no rule as everyone', () => {
    expect(getEditorState(null)).toEqual({ mode: 'everyone' });
  });

  it('should read a chain of roles as one row and a device as another', () => {
    const rowTree = getRowTreeOrThrow(
      and([
        or([
          roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
          roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
        ]),
        DEVICE_IS_MOBILE,
      ]),
    );

    expect(rowTree).toMatchObject({
      logicalOperator: 'AND',
      children: [
        {
          type: 'row',
          subject: 'role',
          operator: 'isAnyOf',
          values: [
            ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
            SALES_ROLE_UNIVERSAL_IDENTIFIER,
          ],
        },
        { type: 'row', subject: 'device', operator: 'is', values: ['MOBILE'] },
      ],
    });
  });

  it('should read one workspace member as "is not" and several as "is none of"', () => {
    expect(
      getRowTreeOrThrow(workspaceMemberIsNot(WORKSPACE_MEMBER_ID)).children,
    ).toMatchObject([
      {
        type: 'row',
        subject: 'workspaceMember',
        operator: 'isNot',
        values: [WORKSPACE_MEMBER_ID],
      },
    ]);

    expect(
      getRowTreeOrThrow(
        and([
          workspaceMemberIsNot(WORKSPACE_MEMBER_ID),
          workspaceMemberIsNot(OTHER_WORKSPACE_MEMBER_ID),
        ]),
      ).children,
    ).toMatchObject([
      {
        type: 'row',
        subject: 'workspaceMember',
        operator: 'isNoneOf',
        values: [WORKSPACE_MEMBER_ID, OTHER_WORKSPACE_MEMBER_ID],
      },
    ]);
  });

  it('should read a nested group of rows', () => {
    const rowTree = getRowTreeOrThrow(
      and([
        roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER),
        or([roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER), DEVICE_IS_MOBILE]),
      ]),
    );

    expect(rowTree.children).toMatchObject([
      {
        type: 'row',
        subject: 'role',
        values: [SALES_ROLE_UNIVERSAL_IDENTIFIER],
      },
      {
        type: 'group',
        logicalOperator: 'OR',
        children: [
          { subject: 'role', values: [ADMIN_ROLE_UNIVERSAL_IDENTIFIER] },
          { subject: 'device', values: ['MOBILE'] },
        ],
      },
    ]);
  });

  it('should keep two devices joined by "or" as two rows', () => {
    const rowTree = getRowTreeOrThrow(
      or([DEVICE_IS_MOBILE, buildDeviceConditionalAvailability('DESKTOP')]),
    );

    expect(rowTree).toMatchObject({
      logicalOperator: 'OR',
      children: [
        { type: 'row', subject: 'device', values: ['MOBILE'] },
        { type: 'row', subject: 'device', values: ['DESKTOP'] },
      ],
    });
  });

  it.each([
    {
      title: 'a third level of groups',
      node: and([
        DEVICE_IS_MOBILE,
        or([
          roleIs(ADMIN_ROLE_UNIVERSAL_IDENTIFIER),
          and([DEVICE_IS_MOBILE, roleIs(SALES_ROLE_UNIVERSAL_IDENTIFIER)]),
        ]),
      ]),
    },
    {
      title: 'a negation',
      node: { type: 'NOT' as const, child: DEVICE_IS_MOBILE },
    },
    {
      title: 'the same role twice',
      node: or([
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
      title: 'a variable the builder has no row for',
      node: comparison({
        operator: 'EQUAL',
        variablePath: 'featureFlags.IS_AI_ENABLED',
        value: 'true',
      }),
    },
  ])('should not read $title as rows', ({ node }) => {
    expect(getEditorState(node)).toEqual({ mode: 'unsupportedRule' });
  });
});
