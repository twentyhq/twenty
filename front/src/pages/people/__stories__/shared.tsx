import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';

import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedClient } from '~/testing/mockedClient';

import { People } from '../People';

export function render() {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <People />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ApolloProvider>
    </RecoilRoot>
  );
}
