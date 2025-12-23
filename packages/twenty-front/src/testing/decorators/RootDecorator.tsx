import { ApolloProvider } from '@apollo/client';
import { type Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ApolloCoreClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloCoreClientMockedProvider';

import { mockedApolloClient } from '~/testing/mockedApolloClient';

export const RootDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  return (
    <RecoilRoot initializeState={parameters.initializeState}>
      <ApolloProvider client={mockedApolloClient}>
        <ApolloCoreClientMockedProvider>
          <Story />
        </ApolloCoreClientMockedProvider>
      </ApolloProvider>
    </RecoilRoot>
  );
};
