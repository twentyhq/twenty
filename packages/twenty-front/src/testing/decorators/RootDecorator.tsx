import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ApolloCoreClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloCoreClientMockedProvider';

import { InitializeHotkeyStorybookHookEffect } from '../InitializeHotkeyStorybookHook';
import { mockedApolloClient } from '../mockedApolloClient';

export const RootDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const disableHotkeyInitialization = parameters.disableHotkeyInitialization;

  return (
    <RecoilRoot initializeState={parameters.initializeState}>
      <ApolloProvider client={mockedApolloClient}>
        <ApolloCoreClientMockedProvider>
          {!disableHotkeyInitialization && (
            <InitializeHotkeyStorybookHookEffect />
          )}
          <Story />
        </ApolloCoreClientMockedProvider>
      </ApolloProvider>
    </RecoilRoot>
  );
};
