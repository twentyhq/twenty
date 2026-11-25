import { ConditionalAvailabilityFilterBuilder } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterBuilder';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, within } from 'storybook/test';
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

const ConditionalAvailabilityFilterBuilderWithLocalState = ({
  filterGroup: initialFilterGroup,
  onFilterGroupChange,
  roleOptions,
  workspaceMemberOptions,
  isReadOnly,
}: ComponentProps<typeof ConditionalAvailabilityFilterBuilder>) => {
  const [filterGroup, setFilterGroup] = useState(initialFilterGroup);

  const handleFilterGroupChange = (
    nextFilterGroup: ConditionalAvailabilityFilterGroup,
  ) => {
    onFilterGroupChange(nextFilterGroup);
    setFilterGroup(nextFilterGroup);
  };

  return (
    <ConditionalAvailabilityFilterBuilder
      filterGroup={filterGroup}
      onFilterGroupChange={handleFilterGroupChange}
      roleOptions={roleOptions}
      workspaceMemberOptions={workspaceMemberOptions}
      isReadOnly={isReadOnly}
    />
  );
};

const meta: Meta<typeof ConditionalAvailabilityFilterBuilder> = {
  title: 'Modules/ConditionalAvailability/ConditionalAvailabilityFilterBuilder',
  component: ConditionalAvailabilityFilterBuilder,
  parameters: { container: { width: 400 } },
  args: {
    filterGroup: EMPTY_FILTER_GROUP,
    onFilterGroupChange: fn(),
    roleOptions: ROLE_OPTIONS,
    workspaceMemberOptions: WORKSPACE_MEMBER_OPTIONS,
    isReadOnly: false,
  },
  decorators: [ComponentDecorator],
  render: ConditionalAvailabilityFilterBuilderWithLocalState,
};

export default meta;
type Story = StoryObj<typeof ConditionalAvailabilityFilterBuilder>;

export const RoleIsAnyOf: Story = {
  args: {
    filterGroup: { ...EMPTY_FILTER_GROUP, children: [ROLE_IS_ANY_OF_FILTER] },
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
    filterGroup: {
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
    filterGroup: {
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
    filterGroup: FILTER_GROUP_WITH_NESTED_FILTER_GROUP,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Or')).toBeVisible();
    await expect(await canvas.findByText('Add rule')).toBeVisible();
    await expect(await canvas.findByText('Add filter rule')).toBeVisible();
  },
};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Add filter rule')).toBeVisible();
    await expect(canvas.queryByText('Where')).toBeNull();
  },
};

export const ReadOnly: Story = {
  args: {
    filterGroup: FILTER_GROUP_WITH_NESTED_FILTER_GROUP,
    isReadOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Tim Apple')).toBeVisible();
    await expect(canvas.queryByText('Add filter rule')).toBeNull();
    await expect(canvas.queryByText('Add rule')).toBeNull();
  },
};
