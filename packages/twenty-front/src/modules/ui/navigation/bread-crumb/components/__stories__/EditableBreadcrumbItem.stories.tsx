import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';

import { findByText, userEvent } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';
import { EditableBreadcrumbItem } from '../EditableBreadcrumbItem';

const onSubmit = jest.fn();

const meta: Meta<typeof EditableBreadcrumbItem> = {
  title: 'UI/Navigation/BreadCrumb/EditableBreadcrumbItem',
  component: EditableBreadcrumbItem,
  decorators: [
    (Story) => (
      <RecoilRoot>
        <Story />
      </RecoilRoot>
    ),
    ComponentDecorator,
  ],
  args: {
    defaultValue: 'Company Name',
    placeholder: 'Enter name',
    hotkeyScope: EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
    onSubmit,
  },
};

export default meta;
type Story = StoryObj<typeof EditableBreadcrumbItem>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const button = await findByText(canvasElement, 'Company Name');
    expect(button).toBeInTheDocument();
  },
};

export const Editing: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    await userEvent.click(button);

    await new Promise((resolve) => setTimeout(resolve, 100));

    await userEvent.keyboard('New Name');
    await userEvent.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('New Name');
  },
};

export const WithNoValue: Story = {
  args: {
    defaultValue: '',
    noValuePlaceholder: 'Untitled',
  },
  play: async ({ canvasElement }) => {
    const button = await findByText(canvasElement, 'Untitled');

    expect(button).toBeInTheDocument();
  },
};
