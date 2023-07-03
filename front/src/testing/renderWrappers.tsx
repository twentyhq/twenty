import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useCompaniesColumns } from '~/pages/companies/companies-columns';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { UserProvider } from '~/providers/user/UserProvider';

import { mockedCompaniesData } from './mock-data/companies';
import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { FullHeightStorybookLayout } from './FullHeightStorybookLayout';
import { mockedClient } from './mockedClient';

export function getRenderWrapperForPage(
  children: React.ReactElement,
  currentPath: string,
) {
  return function render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <UserProvider>
            <MemoryRouter initialEntries={[currentPath]}>
              <FullHeightStorybookLayout>
                <DefaultLayout>{children}</DefaultLayout>
              </FullHeightStorybookLayout>
            </MemoryRouter>
          </UserProvider>
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
          <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}

export function getRenderWrapperForEntityTableComponent(
  children: React.ReactElement,
) {
  return function Render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <RecoilScope SpecificContext={TableContext}>
            <HooksEntityTable
              availableTableFilters={companiesFilters}
              numberOfColumns={5}
              numberOfRows={mockedCompaniesData.length}
            />
            <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
          </RecoilScope>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}
