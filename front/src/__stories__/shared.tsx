import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { isAuthenticatingState } from '@/auth/states/isAuthenticatingState';
import { darkTheme } from '@/ui/layout/styles/themes';
import { App } from '~/App';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedUsersData } from '~/testing/mock-data/users';
import { mockedClient } from '~/testing/mockedClient';

export const render = () => renderWithDarkMode(false);

const MockedAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  setCurrentUser(mockedUsersData[0]);
  setIsAuthenticating(false);

  return <>{children}</>;
};

export const renderWithDarkMode = (forceDarkMode?: boolean) => {
  const AppInStoryBook = (
    <FullHeightStorybookLayout>
      <MockedAuth>
        <App />
      </MockedAuth>
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
