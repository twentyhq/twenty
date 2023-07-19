import { Route, Routes } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import {} from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPeopleData } from '~/testing/mock-data/people';
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
    <Routes>
      <Route path="/person/:personId" element={<PersonShow />} />
    </Routes>,
    `/person/${mockedPeopleData[0].id}`,
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
