import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';

import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedClient } from '~/testing/mockedClient';

import { SettingsProfile } from '../SettingsProfile';

export function render() {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <SettingsProfile />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ApolloProvider>
    </RecoilRoot>
  );
}
