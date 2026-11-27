import { ConditionalAvailabilityFilterBuilder } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterBuilder';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { msg } from '@lingui/core/macro';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { type ExpressionFieldNode } from 'twenty-shared/expression';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  IconPhone,
  IconTag,
  IconUser,
  IconUserCircle,
  IconUsers,
} from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const ROLE_OPTIONS: SelectOption<string>[] = [
  { value: 'role-admin', label: 'Admin' },
  { value: 'role-finance', label: 'Finance' },
  { value: 'role-member', label: 'Member' },
  { value: 'role-ops', label: 'Ops' },
  { value: 'role-sales', label: 'Sales' },
];

const WORKSPACE_MEMBER_OPTIONS: SelectOption<string>[] = [
  { value: 'workspace-member-jony-ive', label: 'Jony Ive' },
  { value: 'workspace-member-phil-schiller', label: 'Phil Schiller' },
  { value: 'workspace-member-tim-apple', label: 'Tim Apple' },
].map(({ value, label }) => ({
  value,
  label,
  LeftComponent: (
    <Avatar shape="circle" size="md" name={label} colorSeed={value} />
  ),
}));

const DEVICE_OPTIONS: SelectOption<string>[] = [
  { value: 'DESKTOP', label: 'Desktop' },
  { value: 'MOBILE', label: 'Mobile' },
];

const FILTER_FIELDS: ConditionalAvailabilityFilterField[] = [
  {
    key: 'currentRole',
    label: msg`Role`,
    Icon: IconUserCircle,
    options: ROLE_OPTIONS,
  },
  {
    key: 'currentWorkspaceMember',
    label: msg`Workspace member`,
    Icon: IconUser,
    options: WORKSPACE_MEMBER_OPTIONS,
  },
  {
    key: 'device',
    label: msg`Device`,
    Icon: IconPhone,
    options: DEVICE_OPTIONS,
  },
];

const STAGE_FIELD: ExpressionFieldNode = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'stage-universal-identifier',
};

const ACCOUNT_OWNER_FIELD: ExpressionFieldNode = {
  type: 'FIELD',
  relationFieldUniversalIdentifier: 'account-owner-universal-identifier',
  fieldUniversalIdentifier: 'workspace-member-id-universal-identifier',
};

const EMPLOYEES_FIELD: ExpressionFieldNode = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'employees-universal-identifier',
};

const FILTER_FIELDS_WITH_RECORD_FIELDS: ConditionalAvailabilityFilterField[] = [
  ...FILTER_FIELDS,
  {
    key: 'account-owner-universal-identifier',
    field: ACCOUNT_OWNER_FIELD,
    type: FieldMetadataType.RELATION,
    objectLabelSingular: 'Company',
    label: 'Account owner',
    Icon: IconUser,
    options: [
      { value: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID, label: 'Me' },
      ...WORKSPACE_MEMBER_OPTIONS,
    ],
  },
  {
    key: 'stage-universal-identifier',
    field: STAGE_FIELD,
    type: FieldMetadataType.SELECT,
    objectLabelSingular: 'Company',
    label: 'Stage',
    Icon: IconTag,
    options: [
      { value: 'NEW', label: 'New' },
      { value: 'WON', label: 'Won' },
    ],
  },
  {
    key: 'employees-universal-identifier',
    field: EMPLOYEES_FIELD,
    type: FieldMetadataType.NUMBER,
    objectLabelSingular: 'Company',
    label: 'Employees',
    Icon: IconUsers,
    options: [],
  },
];

const ROLE_IS_ANY_OF_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'role-filter',
  variable: 'currentRole',
  operator: 'isAnyOf',
  values: ['role-admin', 'role-sales'],
};

const WORKSPACE_MEMBER_IS_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'workspace-member-filter',
  variable: 'currentWorkspaceMember',
  operator: 'is',
  values: ['workspace-member-tim-apple'],
};

const DEVICE_IS_MOBILE_FILTER: ConditionalAvailabilityFilter = {
  type: 'filter',
  id: 'device-filter',
  variable: 'device',
  operator: 'is',
  values: ['MOBILE'],
};

const EMPTY_FILTER_GROUP: ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup',
  id: 'root-filter-group',
  logicalOperator: 'AND',
  children: [],
};

const FILTER_GROUP_WITH_NESTED_FILTER_GROUP: ConditionalAvailabilityFilterGroup =
  {
    ...EMPTY_FILTER_GROUP,
    children: [
      ROLE_IS_ANY_OF_FILTER,
      {
        type: 'filterGroup',
        id: 'nested-filter-group',
        logicalOperator: 'OR',
        children: [WORKSPACE_MEMBER_IS_FILTER, DEVICE_IS_MOBILE_FILTER],
      },
    ],
  };

const meta: Meta<typeof ConditionalAvailabilityFilterBuilder> = {
  title: 'Modules/ConditionalAvailability/ConditionalAvailabilityFilterBuilder',
  component: ConditionalAvailabilityFilterBuilder,
  parameters: { container: { width: 400 } },
  args: {
    filterFields: FILTER_FIELDS,
    defaultValue: EMPTY_FILTER_GROUP,
    onFilterSettingsUpdate: fn(),
    readonly: false,
  },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ConditionalAvailabilityFilterBuilder>;

export const RoleIsAnyOf: Story = {
  args: {
    instanceId: 'role-is-any-of',
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [ROLE_IS_ANY_OF_FILTER],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Where')).toBeVisible();
    await expect(await canvas.findByText('Admin')).toBeVisible();
    await expect(await canvas.findByText('Sales')).toBeVisible();
  },
};

export const DeviceIsMobile: Story = {
  args: {
    instanceId: 'device-is-mobile',
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [DEVICE_IS_MOBILE_FILTER],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Where')).toBeVisible();
    await expect(await canvas.findByText('Mobile')).toBeVisible();
  },
};

export const TwoFiltersJoinedByAnd: Story = {
  args: {
    instanceId: 'two-filters-joined-by-and',
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [ROLE_IS_ANY_OF_FILTER, WORKSPACE_MEMBER_IS_FILTER],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('And')).toBeVisible();
    await expect(await canvas.findByText('Tim Apple')).toBeVisible();
  },
};

export const WithFilterGroup: Story = {
  args: {
    instanceId: 'with-filter-group',
    defaultValue: FILTER_GROUP_WITH_NESTED_FILTER_GROUP,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Or')).toBeVisible();
    await expect(await canvas.findByText('Add rule')).toBeVisible();
    await expect(await canvas.findByText('Add filter rule')).toBeVisible();
  },
};

export const Empty: Story = {
  args: { instanceId: 'empty' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Add filter rule')).toBeVisible();
    await expect(canvas.queryByText('Where')).toBeNull();
  },
};

export const RecordFieldIsMe: Story = {
  args: {
    instanceId: 'record-field-is-me',
    filterFields: FILTER_FIELDS_WITH_RECORD_FIELDS,
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [
        {
          type: 'filter',
          id: 'account-owner-filter',
          field: ACCOUNT_OWNER_FIELD,
          operator: 'is',
          values: [CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Account owner')).toBeVisible();
    await expect(await canvas.findByText('Is')).toBeVisible();
    await expect(await canvas.findByText('Me')).toBeVisible();
  },
};

export const PickRecordField: Story = {
  args: {
    instanceId: 'pick-record-field',
    filterFields: FILTER_FIELDS_WITH_RECORD_FIELDS,
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [{ ...ROLE_IS_ANY_OF_FILTER, values: [] }],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Role'));
    await expect(await body.findByText('Company')).toBeVisible();
    await userEvent.click(await body.findByRole('option', { name: 'Stage' }));

    await userEvent.click(await canvas.findByText('Select a value'));
    await userEvent.click(await body.findByRole('option', { name: 'Won' }));

    await waitFor(() =>
      expect(args.onFilterSettingsUpdate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          children: [
            {
              type: 'filter',
              id: ROLE_IS_ANY_OF_FILTER.id,
              field: STAGE_FIELD,
              operator: 'is',
              values: ['WON'],
            },
          ],
        }),
      ),
    );
  },
};

export const NumberFieldGreaterThanOrEqual: Story = {
  args: {
    instanceId: 'number-field-greater-than-or-equal',
    filterFields: FILTER_FIELDS_WITH_RECORD_FIELDS,
    defaultValue: {
      ...EMPTY_FILTER_GROUP,
      children: [
        {
          type: 'filter',
          id: 'employees-filter',
          field: EMPLOYEES_FIELD,
          operator: 'greaterThanOrEqual',
          values: [500],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Employees')).toBeVisible();
    await expect(
      await canvas.findByText('Greater than or equal'),
    ).toBeVisible();
    await expect(await canvas.findByDisplayValue('500')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    instanceId: 'read-only',
    defaultValue: FILTER_GROUP_WITH_NESTED_FILTER_GROUP,
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Tim Apple')).toBeVisible();
    await expect(canvas.queryByText('Add filter rule')).toBeNull();
    await expect(canvas.queryByText('Add rule')).toBeNull();
  },
};
