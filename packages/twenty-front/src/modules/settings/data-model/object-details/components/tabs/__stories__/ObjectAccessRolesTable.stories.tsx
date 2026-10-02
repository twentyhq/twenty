import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ObjectAccessRolesTable } from '@/settings/data-model/object-details/components/tabs/ObjectAccessRolesTable';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof ObjectAccessRolesTable> = {
  title: 'Modules/Settings/Data Model/Object Access Roles Table',
  component: ObjectAccessRolesTable,
  decorators: [ComponentWithRouterDecorator],
  args: {
    roles: [
      {
        id: '20202020-0000-4000-8000-000000000001',
        label: 'Admin',
        icon: 'IconUserCog',
        canRead: true,
        canUpdate: true,
        canSoftDelete: true,
        hasRowFilter: false,
      },
      {
        id: '20202020-0000-4000-8000-000000000002',
        label: 'Sales',
        icon: 'IconUser',
        canRead: true,
        canUpdate: true,
        canSoftDelete: false,
        hasRowFilter: true,
      },
      {
        id: '20202020-0000-4000-8000-000000000003',
        label: 'Guest',
        icon: 'IconUser',
        canRead: false,
        canUpdate: false,
        canSoftDelete: false,
        hasRowFilter: false,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ObjectAccessRolesTable>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Sales')).toBeVisible();
    expect(canvas.getAllByText('Some records')).toHaveLength(1);
    expect(canvas.getByRole('link', { name: /Guest/ })).toHaveAttribute(
      'href',
      expect.stringContaining('20202020-0000-4000-8000-000000000003'),
    );
  },
};
