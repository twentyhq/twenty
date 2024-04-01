import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { mockedMetadataApolloClient } from '~/testing/mockedMetadataApolloClient';

import { InitializeHotkeyStorybookHookEffect } from '../InitializeHotkeyStorybookHook';
import { mockedApolloClient } from '../mockedApolloClient';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <ApolloProvider client={mockedApolloClient}>
      <ApolloProvider client={mockedMetadataApolloClient}>
        <InitializeHotkeyStorybookHookEffect />
        <Story />
      </ApolloProvider>
    </ApolloProvider>
  </RecoilRoot>
);
