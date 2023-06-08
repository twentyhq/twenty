import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CommandMenu } from '../CommandMenu';

const meta: Meta<typeof CommandMenu> = {
  title: 'Pages/Search/CommandMenu',
  component: CommandMenu,
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const Default: Story = {
  render: getRenderWrapperForPage(<CommandMenu initiallyOpen={true} />),
};
