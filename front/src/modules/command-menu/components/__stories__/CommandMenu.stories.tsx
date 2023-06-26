import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

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
  },
};
