import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ConditionalAvailabilityEditor } from '@/conditional-availability/components/ConditionalAvailabilityEditor';
import { useConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/hooks/useConditionalAvailabilityVisibilityStatus';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { printConditionalAvailabilityNode } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const STORY_ITEM_KEY = 'pageLayoutWidget:story-widget';
const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000003';

const ROLES = [
  {
    __typename: 'Role',
    id: 'role-admin',
    label: 'Admin',
    icon: 'IconUserCog',
    universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
    canBeAssignedToUsers: true,
  },
  {
    __typename: 'Role',
    id: 'role-sales',
    label: 'Sales',
    icon: 'IconUser',
    universalIdentifier: SALES_ROLE_UNIVERSAL_IDENTIFIER,
    canBeAssignedToUsers: true,
  },
];

const group = (
  logicalOperator: ConditionalAvailabilityLogicalOperator,
  children: ConditionalAvailabilityNode[],
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator,
  children,
});

const equals = (path: string, value: string): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path },
  right: { type: 'LITERAL', value },
});

const ADMIN_ROLE_NODE = equals(
  'currentRole.universalIdentifier',
  ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
);
const SALES_ROLE_NODE = equals(
  'currentRole.universalIdentifier',
  SALES_ROLE_UNIVERSAL_IDENTIFIER,
);
const MOBILE_NODE = equals('device', 'MOBILE');
const WORKSPACE_MEMBER_NODE = equals(
  'currentWorkspaceMember.id',
  WORKSPACE_MEMBER_ID,
);
const DEVICE_EXCLUDED_NODE: ConditionalAvailabilityNode = {
  type: 'COMPARISON',
  operator: 'NOT_EQUAL',
  left: { type: 'PATH', path: 'device' },
  right: { type: 'LITERAL', value: 'MOBILE' },
};

const StyledStoryContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  width: 376px;
`;

type ConditionalAvailabilityEditorStoryProps = {
  initialNode: ConditionalAvailabilityNode | null;
  onNodeChange: (node: ConditionalAvailabilityNode | null) => void;
};

const ConditionalAvailabilityEditorStory = ({
  initialNode,
  onNodeChange,
}: ConditionalAvailabilityEditorStoryProps) => {
  const [node, setNode] = useState(initialNode);
  const visibilityStatus = useConditionalAvailabilityVisibilityStatus({
    itemKey: STORY_ITEM_KEY,
    node,
  });

  const handleNodeChange = (nextNode: ConditionalAvailabilityNode | null) => {
    setNode(nextNode);
    onNodeChange(nextNode);
  };

  return (
    <StyledStoryContainer>
      <ConditionalAvailabilityEditor
        metadataName="pageLayoutWidget"
        itemKey={STORY_ITEM_KEY}
        node={node}
        onNodeChange={handleNodeChange}
      />
      <Button disabled={visibilityStatus === 'incompleteRule'}>Save</Button>
    </StyledStoryContainer>
  );
};

const meta: Meta<typeof ConditionalAvailabilityEditorStory> = {
  title: 'Modules/ConditionalAvailability/ConditionalAvailabilityEditor',
  component: ConditionalAvailabilityEditorStory,
  decorators: [PermissionFlagsDecorator, ComponentWithRouterDecorator],
  args: {
    initialNode: null,
    onNodeChange: fn(),
  },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        ...mockedWorkspaceMemberData,
        id: WORKSPACE_MEMBER_ID,
        name: { firstName: 'Jane', lastName: 'Doe' },
        userEmail: 'jane@acme.com',
      },
    ]);
  },
  parameters: {
    permissionFlags: [PermissionFlagType.ROLES],
    msw: {
      handlers: [
        metadataGraphql.query('GetConditionalAvailabilityRoles', () =>
          HttpResponse.json({ data: { getRoles: ROLES } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ConditionalAvailabilityEditorStory>;

export const Everyone: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Everyone' }),
    ).toBeVisible();
    expect(canvas.queryByText('Where')).not.toBeInTheDocument();
    expect(
      canvas.queryByText(/Visibility hides this item on the page/),
    ).not.toBeInTheDocument();
  },
};

export const OneRoleRow: Story = {
  args: { initialNode: ADMIN_ROLE_NODE },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Admin')).toBeVisible();
    expect(canvas.getByText('Where')).toBeVisible();
    expect(canvas.getByText('Role')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Is any of' })).toBeVisible();
    expect(
      canvas.getByRole('link', { name: 'role permissions' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByText('Admin'));
    await userEvent.click(await body.findByRole('option', { name: 'Sales' }));

    await waitFor(() =>
      expect(args.onNodeChange).toHaveBeenLastCalledWith(
        group('OR', [ADMIN_ROLE_NODE, SALES_ROLE_NODE]),
      ),
    );
  },
};

export const WorkspaceMemberRow: Story = {
  args: { initialNode: WORKSPACE_MEMBER_NODE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Workspace member')).toBeVisible();
    expect(canvas.getByText('Jane Doe')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();
  },
};

export const RoleAndDeviceJoinedByAnd: Story = {
  args: {
    initialNode: group('AND', [ADMIN_ROLE_NODE, MOBILE_NODE]),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Admin')).toBeVisible();
    expect(canvas.getByText('Device')).toBeVisible();
    expect(canvas.getByText('Mobile')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'And' }));
    await userEvent.click(await body.findByRole('option', { name: 'Or' }));

    await waitFor(() =>
      expect(args.onNodeChange).toHaveBeenLastCalledWith(
        group('OR', [ADMIN_ROLE_NODE, MOBILE_NODE]),
      ),
    );
  },
};

export const Group: Story = {
  args: {
    initialNode: group('AND', [
      SALES_ROLE_NODE,
      group('OR', [ADMIN_ROLE_NODE, MOBILE_NODE]),
    ]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Sales')).toBeVisible();
    expect(canvas.getByText('Admin')).toBeVisible();
    expect(canvas.getByText('Mobile')).toBeVisible();
    expect(canvas.getByText('Or')).toBeVisible();
    expect(canvas.getAllByText('Where')).toHaveLength(2);
    expect(
      canvas.getByRole('button', { name: 'Rule group options' }),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Add rule' })).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Add filter rule' }),
    ).toBeVisible();
  },
};

export const IncompleteRowDisablesSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Everyone' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom rule' }),
    );

    expect(await canvas.findByText('Select a value')).toBeVisible();
    expect(canvas.getByText('Role')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(args.onNodeChange).not.toHaveBeenCalled();
  },
};

export const ReadOnlyWithoutRolesPermission: Story = {
  args: { initialNode: ADMIN_ROLE_NODE },
  parameters: { permissionFlags: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'This rule names roles you cannot see, so it is shown read only here. A member with the Roles permission can edit it.',
      ),
    ).toBeVisible();
    expect(canvas.getAllByText('Role')).toHaveLength(2);
    expect(
      canvas.queryByRole('button', { name: 'Custom rule' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Rule options' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Add filter rule' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('link', { name: 'role permissions' }),
    ).not.toBeInTheDocument();
  },
};

export const UnsupportedRuleOpensAsReadOnlyText: Story = {
  args: { initialNode: DEVICE_EXCLUDED_NODE },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const rule = await canvas.findByRole('textbox', { name: 'Rule' });

    expect(rule).toHaveValue(
      printConditionalAvailabilityNode({ node: DEVICE_EXCLUDED_NODE }),
    );
    expect(rule).toHaveAttribute('readonly');
    expect(canvas.queryByText('Where')).not.toBeInTheDocument();
    expect(args.onNodeChange).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace with rules' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'Replace' }));

    expect(await canvas.findByText('Where')).toBeVisible();
    expect(canvas.queryByRole('textbox', { name: 'Rule' })).toBeNull();
  },
};
