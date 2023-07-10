import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { PersonShow } from '../PersonShow';

const meta: Meta<typeof PersonShow> = {
  title: 'Pages/People/Person',
  component: PersonShow,
};

export default meta;

export type Story = StoryObj<typeof PersonShow>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <PersonShow />,
    '/companies/89bb825c-171e-4bcc-9cf7-43448d6fb278',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
