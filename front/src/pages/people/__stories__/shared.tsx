import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import { RecoilRoot } from 'recoil';

import { lightTheme } from '@/ui/layout/styles/themes';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedClient } from '~/testing/mockedClient';

import { People } from '../People';

export function render() {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <ThemeProvider theme={lightTheme}>
          <MemoryRouter>
            <FullHeightStorybookLayout>
              <People />
            </FullHeightStorybookLayout>
          </MemoryRouter>
        </ThemeProvider>
      </ApolloProvider>
    </RecoilRoot>
  );
}
