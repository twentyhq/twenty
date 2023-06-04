import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import { RecoilRoot } from 'recoil';

import { lightTheme } from '@/ui/layout/styles/themes';

import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { FullHeightStorybookLayout } from './FullHeightStorybookLayout';
import { mockedClient } from './mockedClient';

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
