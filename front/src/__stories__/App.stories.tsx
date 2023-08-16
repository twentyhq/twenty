import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { App } from '~/App';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUsersData } from '~/testing/mock-data/users';

jest.setTimeout(2000);

const MockedAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [, setCurrentUser] = useRecoilState(currentUserState);

  setCurrentUser(mockedUsersData[0]);

  return <>{children}</>;
};

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <FullHeightStorybookLayout>
          <MockedAuth>
            <Story />
          </MockedAuth>
        </FullHeightStorybookLayout>
      </MemoryRouter>
    ),
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
export type Story = StoryObj<typeof App>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    theming: {
      themeOverride: 'dark',
    },
  },
};
