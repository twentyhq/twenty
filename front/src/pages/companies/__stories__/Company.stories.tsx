import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CompanyShow } from '../CompanyShow';

const meta: Meta<typeof CompanyShow> = {
  title: 'Pages/Companies/Company',
  component: CompanyShow,
};

export default meta;

export type Story = StoryObj<typeof CompanyShow>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <CompanyShow />,
    '/companies/89bb825c-171e-4bcc-9cf7-43448d6fb278',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
