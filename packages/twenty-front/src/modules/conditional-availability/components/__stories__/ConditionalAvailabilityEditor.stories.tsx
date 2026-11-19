import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ConditionalAvailabilityEditor } from '@/conditional-availability/components/ConditionalAvailabilityEditor';
import { useConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/hooks/useConditionalAvailabilityVisibilityStatus';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { useMemo, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  type CompositeFieldSubFieldName,
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
  RecordFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  printConditionalAvailabilityNode,
} from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const STORY_ITEM_KEY = 'pageLayoutWidget:story-widget';
const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALES_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const UNKNOWN_RECORD_ID = '20202020-9999-4000-8000-000000000001';
const REMOVED_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-9999-4000-8000-000000000002';

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

const recordFilter = ({
  objectNameSingular,
  fieldName,
  subFieldName = null,
  operand,
  value = '',
}: {
  objectNameSingular: string;
  fieldName: string;
  subFieldName?: CompositeFieldSubFieldName | null;
  operand: RecordFilterOperand;
  value?: string;
}): ConditionalAvailabilityNode => ({
  type: 'SELECTED_RECORDS',
  quantifier: 'EVERY',
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

const ACCOUNT_OWNER_IS_ME_NODE = recordFilter({
  objectNameSingular: 'company',
  fieldName: 'accountOwner',
  operand: RecordFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
});

const COMPANY_RECORD_FIELDS_NODE = group('AND', [
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'name',
    operand: RecordFilterOperand.CONTAINS,
    value: 'Acme',
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'employees',
    operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    value: '50',
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'annualRecurringRevenue',
    subFieldName: 'amountMicros',
    operand: RecordFilterOperand.LESS_THAN_OR_EQUAL,
    value: '1500',
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'idealCustomerProfile',
    operand: RecordFilterOperand.IS,
    value: 'true',
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'workPolicy',
    operand: RecordFilterOperand.CONTAINS,
    value: JSON.stringify(['REMOTE_WORK', 'FOUR_DAY_WEEK']),
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'createdAt',
    operand: RecordFilterOperand.IS_IN_PAST,
  }),
  recordFilter({
    objectNameSingular: 'company',
    fieldName: 'tagline',
    operand: RecordFilterOperand.IS_EMPTY,
  }),
  ACCOUNT_OWNER_IS_ME_NODE,
]);

const OPPORTUNITY_RECORD_FIELDS_NODE = group('AND', [
  recordFilter({
    objectNameSingular: 'opportunity',
    fieldName: 'stage',
    operand: RecordFilterOperand.IS,
    value: JSON.stringify(['PROPOSAL', 'NEW']),
  }),
  recordFilter({
    objectNameSingular: 'opportunity',
    fieldName: 'closeDate',
    operand: RecordFilterOperand.IS,
    value: '2026-11-16',
  }),
  recordFilter({
    objectNameSingular: 'opportunity',
    fieldName: 'company',
    operand: RecordFilterOperand.IS,
    value: JSON.stringify({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [UNKNOWN_RECORD_ID],
    }),
  }),
  recordFilter({
    objectNameSingular: 'opportunity',
    fieldName: 'amount',
    subFieldName: 'currencyCode',
    operand: RecordFilterOperand.IS,
    value: JSON.stringify(['EUR']),
  }),
]);

const REMOVED_FIELD_NODE = group('AND', [
  ADMIN_ROLE_NODE,
  {
    type: 'SELECTED_RECORDS',
    quantifier: 'EVERY',
    recordFilter: {
      fieldMetadataUniversalIdentifier: REMOVED_FIELD_UNIVERSAL_IDENTIFIER,
      subFieldName: null,
      operand: RecordFilterOperand.IS,
      value: 'a',
    },
  },
]);

const StyledStoryContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  width: 376px;
`;

type ConditionalAvailabilityEditorStoryProps = {
  initialNode: ConditionalAvailabilityNode | null;
  objectNameSingular: string | null;
  onNodeChange: (node: ConditionalAvailabilityNode | null) => void;
};

const ConditionalAvailabilityEditorStory = ({
  initialNode,
  objectNameSingular,
  onNodeChange,
}: ConditionalAvailabilityEditorStoryProps) => {
  const [node, setNode] = useState(initialNode);
  const objectMetadataItem = useMemo(
    () =>
      isDefined(objectNameSingular)
        ? getMockObjectMetadataItemOrThrow(objectNameSingular)
        : null,
    [objectNameSingular],
  );
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
        objectMetadataItem={objectMetadataItem}
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
    objectNameSingular: null,
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

export const RecordFieldRowsOnCompany: Story = {
  args: {
    initialNode: COMPANY_RECORD_FIELDS_NODE,
    objectNameSingular: 'company',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Acme')).toBeVisible();
    expect(canvas.getByText('Name')).toBeVisible();
    expect(canvas.getAllByRole('button', { name: 'Contains' })).toHaveLength(2);
    expect(canvas.getByDisplayValue('50')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'At least' })).toBeVisible();
    expect(canvas.getByText('ARR · Amount')).toBeVisible();
    expect(canvas.getByDisplayValue('1500')).toBeVisible();
    expect(canvas.getByText('True')).toBeVisible();
    expect(canvas.getByText('Remote Work')).toBeVisible();
    expect(canvas.getByText('Unknown option FOUR_DAY_WEEK')).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Is in the past' }),
    ).toBeVisible();
    expect(canvas.getByText('Tagline')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Is empty' })).toBeVisible();
    expect(canvas.getByText('Account Owner')).toBeVisible();
    expect(canvas.getByText('Me')).toBeVisible();
    expect(canvas.queryByText('Select a value')).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();
  },
};

export const RecordFieldRowsOnOpportunity: Story = {
  decorators: [ObjectMetadataItemsDecorator, ToastDecorator],
  args: {
    initialNode: OPPORTUNITY_RECORD_FIELDS_NODE,
    objectNameSingular: 'opportunity',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Proposal')).toBeVisible();
    expect(canvas.getByText('New')).toBeVisible();
    expect(canvas.getByText('Close date')).toBeVisible();
    expect(await canvas.findByText('Unknown record')).toBeVisible();
    expect(canvas.getByText('Amount · Currency')).toBeVisible();
    expect(canvas.getByText(/Euro/)).toBeVisible();
  },
};

export const PickAccountOwnerIsMe: Story = {
  args: { objectNameSingular: 'company' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Everyone' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom rule' }),
    );
    await userEvent.click(await canvas.findByText('Role'));

    expect(await body.findByText('Company')).toBeVisible();

    await userEvent.click(
      await body.findByRole('button', { name: 'Account Owner' }),
    );

    expect(await canvas.findByText('Account Owner')).toBeVisible();
    expect(canvas.getByText('Select a value')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();

    await userEvent.click(canvas.getByText('Select a member'));
    await userEvent.click(await body.findByRole('option', { name: 'Me' }));

    await waitFor(() =>
      expect(args.onNodeChange).toHaveBeenLastCalledWith(
        ACCOUNT_OWNER_IS_ME_NODE,
      ),
    );
    expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();
  },
};

export const CompositeSubFieldMenu: Story = {
  args: {
    initialNode: COMPANY_RECORD_FIELDS_NODE,
    objectNameSingular: 'company',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Name'));
    await userEvent.click(await body.findByRole('button', { name: 'Address' }));

    expect(
      await body.findByRole('button', { name: 'Address, back to fields' }),
    ).toBeVisible();
    expect(body.getByRole('button', { name: 'Address 1' })).toBeVisible();

    await userEvent.click(body.getByRole('button', { name: 'City' }));

    expect(await canvas.findByText('Address · City')).toBeVisible();
    expect(canvas.queryByText('Acme')).not.toBeInTheDocument();
    expect(canvas.getByText('Select a value')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const RemovedFieldOpensAsReadOnlyText: Story = {
  args: {
    initialNode: REMOVED_FIELD_NODE,
    objectNameSingular: 'company',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const rule = await canvas.findByRole('textbox', { name: 'Rule' });

    expect(rule).toHaveValue(
      printConditionalAvailabilityNode({ node: REMOVED_FIELD_NODE }),
    );
    expect(rule).toHaveAttribute('readonly');
    expect(canvas.queryByText('Where')).not.toBeInTheDocument();
    expect(args.onNodeChange).not.toHaveBeenCalled();
  },
};
