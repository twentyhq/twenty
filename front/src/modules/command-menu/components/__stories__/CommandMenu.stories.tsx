import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators';
import { sleep } from '~/testing/sleep';

import { CommandMenu } from '../CommandMenu';

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: CommandMenu,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const Default: Story = {};

export const CmdK: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });

    await sleep(50);

    const canvas = within(document.body);

    const searchInput = await canvas.findByPlaceholderText('Search');

    await userEvent.type(searchInput, '{arrowdown}');
    await userEvent.type(searchInput, '{arrowup}');
    await userEvent.type(searchInput, '{arrowdown}');
    await userEvent.type(searchInput, '{arrowdown}');
    await userEvent.type(searchInput, '{enter}');

    await sleep(50);

    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
  },
};
