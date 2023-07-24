import React from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { MemoryRouter } from 'react-router-dom';

import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { INITIAL_HOTKEYS_SCOPES } from '@/ui/hotkey/constants';
import { DefaultLayout } from '@/ui/layout/components/DefaultLayout';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { TableContext } from '@/ui/table/states/TableContext';
import { UserProvider } from '@/users/components/UserProvider';
import { companiesFilters } from '~/pages/companies/companies-filters';

import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { FullHeightStorybookLayout } from './FullHeightStorybookLayout';

export function getRenderWrapperForPage(
  children: React.ReactElement,
  currentPath: string,
) {
  return function render() {
    return (
      <UserProvider>
        <ClientConfigProvider>
          <HotkeysProvider initiallyActiveScopes={INITIAL_HOTKEYS_SCOPES}>
            <MemoryRouter initialEntries={[currentPath]}>
              <FullHeightStorybookLayout>
                <DefaultLayout>{children}</DefaultLayout>
              </FullHeightStorybookLayout>
            </MemoryRouter>
          </HotkeysProvider>
        </ClientConfigProvider>
      </UserProvider>
    );
  };
}

export function getRenderWrapperForEntityTableComponent(
  children: React.ReactElement,
) {
  return function Render() {
    return (
      <RecoilScope SpecificContext={TableContext}>
        {/*
        TODO: add company mocked loader
        <CompanyEntityTableData */}

        <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
      </RecoilScope>
    );
  };
}
