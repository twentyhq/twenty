import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import { RecoilRoot } from 'recoil';

import { darkTheme } from '@/ui/layout/styles/themes';
import { App } from '~/App';
import { AuthProvider } from '~/providers/AuthProvider';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedClient } from '~/testing/mockedClient';

export const render = () => renderWithDarkMode(false);

export const renderWithDarkMode = (forceDarkMode?: boolean) => {
  const AppInStoryBook = (
    <FullHeightStorybookLayout>
      <AuthProvider>
        <App />
      </AuthProvider>
    </FullHeightStorybookLayout>
  );

  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <MemoryRouter>
          {forceDarkMode ? (
            <ThemeProvider theme={darkTheme}>{AppInStoryBook}</ThemeProvider>
          ) : (
            AppInStoryBook
          )}
        </MemoryRouter>
      </ApolloProvider>
    </RecoilRoot>
  );
};
