import { ApolloProvider } from '@apollo/client';
import { type Decorator } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';

import { ApolloCoreClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloCoreClientMockedProvider';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

import { mockedApolloClient } from '~/testing/mockedApolloClient';

export const RootDecorator: Decorator = (Story) => {
  return (
    <JotaiProvider store={jotaiStore}>
      <ApolloProvider client={mockedApolloClient}>
        <ApolloCoreClientMockedProvider>
          <Story />
        </ApolloCoreClientMockedProvider>
      </ApolloProvider>
    </JotaiProvider>
  );
};
