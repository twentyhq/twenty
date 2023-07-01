import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, within } from '@storybook/testing-library';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';
import { sleep } from '~/testing/sleep';

import { CommandMenu } from '../CommandMenu';

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: CommandMenu,
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <MemoryRouter>
      <CommandMenu />
    </MemoryRouter>,
  ),
};

export const CmdK: Story = {
  render: getRenderWrapperForComponent(
    <MemoryRouter>
      <CommandMenu />
    </MemoryRouter>,
  ),
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
