import { buildConditionalAvailabilityNode } from '@/conditional-availability/utils/buildConditionalAvailabilityNode';
import { getConditionalAvailabilityEditorStateFromNode } from '@/conditional-availability/utils/getConditionalAvailabilityEditorStateFromNode';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

const ADMIN = '20202020-0000-4000-8000-000000000001';
const SALES = '20202020-0000-4000-8000-000000000002';
const MEMBER_ID = '20202020-1111-4000-8000-000000000001';
const OTHER_MEMBER_ID = '20202020-1111-4000-8000-000000000002';

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
  path,
  value,
}: {
  operator: 'EQUAL' | 'NOT_EQUAL';
  path: string;
  value: string;
}): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator,
  left: { type: 'PATH', path },
  right: { type: 'LITERAL', value },
});

const roleIs = (role: string) =>
  comparison({
    operator: 'EQUAL',
    path: 'currentRole.universalIdentifier',
    value: role,
  });
const memberIsNot = (memberId: string) =>
  comparison({
    operator: 'NOT_EQUAL',
    path: 'currentWorkspaceMember.id',
    value: memberId,
  });
const MOBILE = comparison({
  operator: 'EQUAL',
  path: 'device',
  value: 'MOBILE',
});

const read = (node: ConditionalAvailabilityNode | null) =>
  getConditionalAvailabilityEditorStateFromNode({
    node,
    metadataName: 'pageLayoutWidget',
  });

const readTree = (node: ConditionalAvailabilityNode) => {
  const result = read(node);

  if (result.mode !== 'customRule') {
    throw new Error(`The rule was read as ${result.mode}`);
  }

  expect(buildConditionalAvailabilityNode({ tree: result.tree })).toEqual(node);

  return result.tree;
};

describe('getConditionalAvailabilityEditorStateFromNode', () => {
  it('should read no rule as everyone', () => {
    expect(read(null)).toEqual({ mode: 'everyone' });
  });

  it('should read a chain of roles as one row and a device as another', () => {
    const tree = readTree(and([or([roleIs(ADMIN), roleIs(SALES)]), MOBILE]));

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
    expect(readTree(memberIsNot(MEMBER_ID)).children).toMatchObject([
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
      readTree(and([memberIsNot(MEMBER_ID), memberIsNot(OTHER_MEMBER_ID)]))
        .children,
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
    const tree = readTree(and([roleIs(SALES), or([roleIs(ADMIN), MOBILE])]));

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

  it.each([
    {
      title: 'a third level of groups',
      node: and([MOBILE, or([roleIs(ADMIN), and([MOBILE, roleIs(SALES)])])]),
    },
    { title: 'a negation', node: { type: 'NOT' as const, child: MOBILE } },
    {
      title: 'the same role twice',
      node: or([roleIs(ADMIN), roleIs(ADMIN)]),
    },
    {
      title: 'a device that is not a device',
      node: comparison({ operator: 'EQUAL', path: 'device', value: 'TABLET' }),
    },
    {
      title: 'a device excluded',
      node: comparison({
        operator: 'NOT_EQUAL',
        path: 'device',
        value: 'MOBILE',
      }),
    },
    {
      title: 'a variable the builder has no row for',
      node: comparison({
        operator: 'EQUAL',
        path: 'featureFlags.IS_AI_ENABLED',
        value: 'true',
      }),
    },
  ])('should not read $title as rows', ({ node }) => {
    expect(read(node)).toEqual({ mode: 'unsupportedRule' });
  });
});
