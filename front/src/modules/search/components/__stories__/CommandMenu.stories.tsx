import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommandMenu } from '../CommandMenu';

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/Search/CommandMenu',
  component: CommandMenu,
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <MemoryRouter>
      <CommandMenu initiallyOpen={true} />
    </MemoryRouter>,
  ),
};
