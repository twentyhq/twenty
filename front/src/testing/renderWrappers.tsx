import { MemoryRouter } from 'react-router-dom';
import { FullHeightStorybookLayout } from './FullHeightStorybookLayout';
import { ThemeProvider } from '@emotion/react';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';
import { mockedClient } from './mockedClient';
import { lightTheme } from '../layout/styles/themes';
import React from 'react';
import { ComponentStorybookLayout } from './ComponentStorybookLayout';

export function getRenderWrapperForPage(children: React.ReactElement) {
  return function render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <ThemeProvider theme={lightTheme}>
            <MemoryRouter>
              <FullHeightStorybookLayout>{children}</FullHeightStorybookLayout>
            </MemoryRouter>
          </ThemeProvider>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}

export function getRenderWrapperForComponent(children: React.ReactElement) {
  return function render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <ThemeProvider theme={lightTheme}>
            <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
          </ThemeProvider>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}
