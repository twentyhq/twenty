import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';

import { InitializeHotkeyStorybookHookEffect } from '../InitializeHotkeyStorybookHook';
import { mockedClient } from '../mockedClient';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <ApolloMetadataClientProvider>
        <InitializeHotkeyStorybookHookEffect />
        <Story />
      </ApolloMetadataClientProvider>
    </ApolloProvider>
  </RecoilRoot>
);
