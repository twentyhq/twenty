import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconList } from '@/ui/icon/index';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { availableSorts } from '~/pages/companies/companies-sorts';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TableContext } from '../../../states/TableContext';
import { TableHeader } from '../TableHeader';

const meta: Meta<typeof TableHeader> = {
  title: 'UI/Table/TableHeader',
  component: TableHeader,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={TableContext}>
        <Story />
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
  argTypes: { viewIcon: { control: false } },
  args: {
    viewName: 'ViewName',
    viewIcon: <IconList />,
    availableSorts,
  },
};

export default meta;
type Story = StoryObj<typeof TableHeader>;

export const Empty: Story = {};

export const WithSortsAndFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outsideClick = await canvas.findByText('ViewName');

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Name'));
    const nameInput = await canvas.findByPlaceholderText('Name');
    userEvent.type(nameInput, 'My name');
    userEvent.click(outsideClick);

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Name'));

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Creation'));

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Address'));

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Employees'));
    const employeesInput = await canvas.findByPlaceholderText('Employees');
    userEvent.type(employeesInput, '12');

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Url'));

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Created at'));
    userEvent.click(await canvas.findByText('6'));
    userEvent.click(outsideClick);
  },
};
