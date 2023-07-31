import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { InitializeHotkeyStorybookHook } from '../InitializeHotkeyStorybookHook';
import { mockedClient } from '../mockedClient';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <InitializeHotkeyStorybookHook />
      <Story />
    </ApolloProvider>
  </RecoilRoot>
);
