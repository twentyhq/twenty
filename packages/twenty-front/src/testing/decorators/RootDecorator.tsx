import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ApolloMetadataClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloMetadataClientMockedProvider';

import { InitializeHotkeyStorybookHookEffect } from '../InitializeHotkeyStorybookHook';
import { mockedApolloClient } from '../mockedApolloClient';

export const RootDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const disableHotkeyInitialization = parameters.disableHotkeyInitialization;

  return (
    <RecoilRoot>
      <ApolloProvider client={mockedApolloClient}>
        <ApolloMetadataClientMockedProvider>
          {!disableHotkeyInitialization && (
            <InitializeHotkeyStorybookHookEffect />
          )}
          <Story />
        </ApolloMetadataClientMockedProvider>
      </ApolloProvider>
    </RecoilRoot>
  );
};
